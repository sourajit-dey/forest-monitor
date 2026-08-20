# AGENTS2.md — Feature addition: predictive risk layer (read after AGENTS.md)

This file assumes AGENTS.md has already been read and its decisions are in effect (card-free
stack, Hugging Face Spaces backend, GEE noncommercial Community Tier). This file covers the
two phases that happen on this side of the project — data extraction and integration. Model
training is a separate, standalone phase that happens on different hardware and is fully
specified in **TRAINING.md**, not here — this file only defines what goes into training
(§2's CSV) and what comes back out of it (§3's two `.onnx` files + a metrics report). Nothing
here overrides AGENTS.md.

## 0. Why this feature exists

The existing pipeline (Sentinel-2 → NDVI → delta → threshold → flag) is reactive: it reports
change after it has already happened. This feature adds a second, forward-looking layer: a
model that learns the spatial/temporal pattern that historically preceded forest loss, so it
can flag areas at elevated risk before clearing starts. The existing pipeline is not replaced
or modified — it becomes "Detected Incidents" (reactive), and this feature becomes "Predicted
Risk Zones" (proactive), as two separate toggleable map layers.

## 1. Feature architecture

```
                    ┌─────────────────────────────────────┐
                    │  EXISTING (AGENTS.md, unchanged)      │
                    │  Sentinel-2 → NDVI delta → threshold  │
                    │  → "Detected Incidents" layer          │
                    └─────────────────────────────────────┘

                    ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
                    │ THIS FILE     │   │ TRAINING.md        │   │ THIS FILE          │
                    │ §2: extract   │──▶│ (separate machine,  │──▶│ §3: integrate      │
                    │ labeled CSV   │   │  GPU, standalone)   │   │ .onnx into backend │
                    └──────────────┘   └──────────────────┘   └──────────────────┘
```

Both new-feature layers render on the same Leaflet map as the existing layer, independently
toggleable, feeding into the same incident popup / Gemini report pattern from AGENTS.md.

## 2. Data extraction (run this yourself, before anything goes to TRAINING.md)

Ground truth: **Hansen Global Forest Change** (`UMD/hansen/global_forest_change_2023_v1_11`),
already available inside Earth Engine — gives a real per-pixel forest-loss year for the
region. This is the labeled dataset; nothing is hand-labeled.

```python
import ee
ee.Initialize(project="<GEE_PROJECT_ID>")

# Deliberately scoped to your target district(s), NOT global. Reasons: (1) far less data to
# pull/process — a few thousand regional points vs. an unmanageable global sample; (2) forest
# spectral signatures, seasonality, and cloud patterns differ by region, so a model trained on
# your actual deployment area is more accurate there than one trained on a global mix trying to
# fit everywhere at once; (3) it's the stronger jury answer — "tuned to our deployment region"
# beats "trained on the whole planet" when asked whether this generalizes. If you ever need a
# second region for comparison, add it as a second AOI + separate held-out split, not by
# widening this one to be global.
AOI = ee.Geometry.Rectangle([...])  # reuse the same bounding box as the existing demo AOI

hansen = ee.Image("UMD/hansen/global_forest_change_2023_v1_11")
loss = hansen.select("loss")
lossyear = hansen.select("lossyear")           # 0-23 encodes 2000-2023
treecover2000 = hansen.select("treecover2000")

TARGET_YEARS = list(range(18, 24))              # 2018-2023; adjust to data availability

positives = loss.eq(1).And(lossyear.gte(min(TARGET_YEARS))).And(treecover2000.gt(50))
negatives = loss.eq(0).And(treecover2000.gt(50))

pos_points = positives.selfMask().sample(region=AOI, scale=30, numPixels=1500, geometries=True)
neg_points = negatives.selfMask().sample(region=AOI, scale=30, numPixels=1500, geometries=True)
```

For every point: pull Sentinel-2 NDVI as **monthly composites for the 36 months immediately
before** that point's event (or before an arbitrary reference date for negatives — no event to
anchor to). Reduce clouds with `CLOUDY_PIXEL_PERCENTAGE < 20` filtering, matching the cloud
handling already used in `gee/ndvi.py`.

**Hard rule, non-negotiable:** a positive sample's input window must end *before* its recorded
loss year. Any post-loss data in the input makes the model memorize the answer instead of
predicting it — flag this explicitly when handing the CSV off, since it's the first thing a
technically literate judge will probe.

Static features per point, all free inside GEE:
- `slope` — `ee.Terrain.slope(ee.Image("USGS/SRTMGL1_003"))`
- `dist_to_prior_clearing` — distance transform on the historical loss mask
- `dist_to_settlement` — from `JRC/GHSL/P2023A/GHS_BUILT_S`

Export everything as one CSV: `[point_id, label, lossyear_or_none, month_1_ndvi..month_36_ndvi,
slope, dist_to_prior_clearing, dist_to_settlement]`. **This CSV is the entire handoff to
TRAINING.md** — nothing else needs to leave this machine for training to proceed.

## 3. Integration into the existing app (after TRAINING.md's output comes back)

Expected deliverables from TRAINING.md: `risk_model.onnx`, `change_classifier.onnx`, and a
metrics report (precision/recall/F1/AUROC on a held-out district, plus the same metrics for
plain NDVI-threshold on that district for comparison).

1. `backend/ml/` — place both `.onnx` files here (per AGENTS.md's folder tree). Committed via
   the Hugging Face Space's git-lfs, same as any other file in that repo.
2. `backend/ml/predict.py` — loads both models once at process start via
   `onnxruntime.InferenceSession(...)`, exposes a scoring function each existing/new endpoint
   can call. Not per-request loading.
3. `gee/features.py` — a live-inference feature-extraction function returning the same feature
   shape the models were trained on (slope, distance features, current NDVI sequence). This is
   the online counterpart to §2's offline script; keep both reading from the same GEE
   collections/bands so they can't silently drift apart.
4. New endpoint `/api/risk-map/`, following the same request/response conventions as the
   existing `/api/analyze/` and `/api/incidents/` endpoints in AGENTS.md's `apps/analysis/`
   and `apps/incidents/`.
5. Existing incident responses gain two fields: `predicted_class`, `confidence`. These flow
   into the existing Gemini prompt as additional structured input — Gemini's role (write, not
   decide — AGENTS.md §2) is unchanged.
6. Frontend: one new toggleable Leaflet layer ("Predicted Risk Zones") alongside the existing
   "Detected Incidents" layer; one new field rendered in the incident popup component.
7. Test `backend/ml/predict.py` directly (call it, confirm a sane score) before wiring up the
   endpoint or the frontend layer.

## 4. Scope-cuts already made, and why

- **No roads dataset in the feature set.** A reliable free roads vector for Indian districts
  isn't natively in GEE's catalog — sourcing one means an OSM Overpass export, local
  processing, and re-upload as an EE asset, for one feature's worth of signal.
  `dist_to_prior_clearing` captures much of the same "accessibility" pattern (clearing tends to
  spread from existing clearings) without that overhead. Add roads post-hackathon if useful.
- **SAR (Sentinel-1) is optional**, not required, in the extracted sequence. Start NDVI-only,
  since that reuses `gee/ndvi.py` directly; add SAR bands only if TRAINING.md's validation
  numbers come back weak on NDVI alone — this is a decision to revisit with whoever is training,
  since it changes what §2's script needs to extract.

## 5. Known risks and mitigations

Named explicitly so none of these are a surprise mid-build or mid-demo.

| Risk | Likelihood | Mitigation |
|---|---|---|
| Pre-event/post-event data leakage bug in §2's extraction (accidentally includes data from during/after the loss event) | Medium — easy off-by-one to make | Spot-check a handful of positive rows manually: confirm the last NDVI month in the sequence genuinely predates `lossyear`. Do this before sending the CSV to TRAINING.md, not after getting suspiciously good metrics back. |
| No region/district identifier in the CSV, so TRAINING.md can't do a proper geography-based split | Medium | Add a `district_id` (or similar) column during §2 extraction — cheap to add now, expensive to redo extraction for later. |
| TRAINING.md's timeline slips (GPU access, debugging, etc.) | Medium | Model B already has a tabular fallback (§3 of TRAINING.md) that doesn't depend on image-patch export — falling back doesn't require redoing §2's data. Model A has no fallback scope-cut; if it's genuinely at risk of not finishing, the existing NDVI-threshold pipeline in AGENTS.md still works as a complete, demoable system on its own. |
| Hugging Face Space crashes, OOMs, or is asleep during the demo | Medium — free CPU tier, not guaranteed uptime | Load both ONNX models once at startup, not per-request (§3). Open the Space URL a few minutes before presenting to force a warm start. Frontend should show a "still loading" state on a slow/failed `/api/risk-map/` call instead of erroring visibly. |
| GEE Community Tier quota (150 EECU-hours/month) gets exhausted | Low for this project's scale | One-time extraction plus per-demo live calls stay well under this for a single-region hackathon project; if worried, check usage once in Cloud Monitoring rather than guessing. |
| `gee/features.py` (live inference) and §2's offline extraction script drift out of sync — model trained on one feature definition, served with a slightly different one | Medium — easy to introduce accidentally when editing either side later | Keep both reading from the same GEE collection/band names (already noted in §3); when either changes, check the other. |
| Model B's full (image-patch) version isn't ready in time, so the demo shows only the tabular fallback's coarser labels | Low-medium | Not actually a failure — §3 of TRAINING.md treats the fallback as a legitimate scope choice, not a broken feature. Frame it that way if asked, rather than apologizing for it. |

The one thing that isn't on this list because it isn't a real risk: the existing reactive
pipeline from AGENTS.md. It's already built and working — worst case for this whole feature
addition is that "Predicted Risk Zones" doesn't ship, and "Detected Incidents" still does.

## 6. Definition of done for this side of the feature

- [ ] Phase-2 CSV exists with both classes, pre-event-only windows, and the three static
      features — handed off to TRAINING.md.
- [ ] `.onnx` files and metrics report received back from TRAINING.md.
- [ ] `backend/ml/predict.py` returns a sane score when called directly.
- [ ] `/api/risk-map/` endpoint live and returning real inference results.
- [ ] Frontend layer toggle working, incident popup showing `predicted_class` + `confidence`.
