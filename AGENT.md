# AGENT.md
Forest Monitoring & Illegal Land-Use Detection WebGIS — Engineering Blueprint

This file is the complete spec for building this project. Treat everything
below as authoritative project context and constraints. Where a decision is
marked **RESOLVED**, follow it — don't re-litigate it or introduce extra
technology "to be safe." Where something is marked **CONFIGURABLE**, expose
it as a setting rather than hardcoding it. Read this whole file before
writing any code.

---

## 0. What this project is

A hackathon-grade WebGIS that uses free Sentinel-2 satellite imagery and
deterministic remote-sensing math (NDVI change detection) to flag areas of
**potential** vegetation loss for forest officers to verify — not an ML
classifier, not a legal determination engine.

Users: state forest department staff, Ministry of Tribal Affairs /
Environment stakeholders (for the demo: hackathon jury playing that role).

**Hard terminology rule, enforced everywhere in UI copy, API responses, and
Gemini prompts:** never say "illegal deforestation" or "confirmed." Always
say "potential vegetation loss," "detected vegetation-loss area," or
"requires field verification."

---

## 1. Non-negotiable constraints

- No ML model training. NDVI + thresholding + connected-component
  filtering only.
- No Google Cloud Run, Cloud Storage, Cloud SQL, or any paid-by-default
  Google Cloud product. Earth Engine itself is fine (registered
  Noncommercial/Community — see INSTRUCTIONS.md) because it requires no
  billing account at that tier.
- No credit card anywhere in the stack. Every service used must have a
  genuinely free tier with no card entry (Render, Vercel, Neon/Supabase,
  Earth Engine Community tier, Gemini free API key).
- **Raw satellite imagery must never pass through Django/Render.** Only
  derived, small outputs (tile URL templates, JSON metadata, simplified
  GeoJSON, Gemini text) touch the backend.
- Do not add Celery, Redis, Docker, or background job queues unless a
  specific, stated bottleneck requires them (see §7 for the reasoning —
  short version: not needed for MVP).
- Every AOI request must be size-limited server-side before it reaches
  Earth Engine, to protect quota and keep the demo fast.

---

## 2. Key architectural decision: tiles bypass the backend entirely

This is the single most important optimization and it resolves the
free-tier bandwidth concern from the brief:

```
Django calls ee.Image.getMapId() on the processed NDVI-change image
   → returns a signed XYZ tile URL template pointing at
     https://earthengine.googleapis.com/...
   → Django returns ONLY this URL template (a few hundred bytes of JSON)
     to the frontend
   → Leaflet's L.tileLayer() requests tiles DIRECTLY from Google's tile
     servers, for whatever the user is currently viewing
   → Render's bandwidth is never touched by imagery, at any zoom level
```

Django/Render only ever transmits:
1. Small JSON (tile URL templates, incident metadata, status)
2. Simplified GeoJSON for a single clicked incident (on demand, not the
   whole AOI)
3. Gemini-generated report text (KB-scale)

This is why the "zoomed out = raster, zoomed in = vector" strategy from
the original brief is correct — refine it as: raster tiles come from
Google directly, never from Django; only the on-click incident GeoJSON
comes from Django, and only for the one clicked incident, not the whole
region.

---

## 3. Final architecture

```
                         USER (forest officer / jury)
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │  VERCEL (frontend)   │
                        │  React + Leaflet     │
                        └──────────┬───────────┘
                                   │ small JSON/GeoJSON only
                                   ▼
                        ┌─────────────────────┐
                        │  RENDER (backend)    │
                        │  Django + DRF        │
                        └──┬──────────┬────────┘
                           │          │
                 ┌─────────┘          └─────────┐
                 ▼                               ▼
      ┌────────────────────┐          ┌────────────────────┐
      │ Google Earth Engine │          │   Gemini API        │
      │ (service account)   │          │ (report generation) │
      │ Sentinel-2, NDVI,   │          └────────────────────┘
      │ change detection    │
      └─────────┬───────────┘
                │ tile URL template returned to Django→frontend;
                │ actual tile PIXELS flow directly to the browser
                ▼
       (tiles served straight to Leaflet, bypassing Render)

      ┌────────────────────┐
      │ Neon/Supabase       │  ← Postgres: incidents, jobs, cache table
      │ Postgres            │
      └────────────────────┘
```

---

## 4. Resolved technology decisions (from the brief's open questions)

| Question | Decision | Why |
|---|---|---|
| Should Django talk directly to GEE? | **Yes**, via the Python API + service account, never expose GEE credentials to frontend | Keeps credentials server-side only |
| GEE JS Code Editor vs Python API for dev? | **Prototype logic in the Code Editor first**, then port to Python `earthengine-api` | Fast iteration, visual feedback, before wiring into Django |
| Export results to Cloud Storage? | **No** | Unnecessary for MVP; tile URLs + small GeoJSON are enough |
| Frontend talk to GEE directly? | **No** — only Django initializes GEE (with service account); frontend only ever talks to Django and to the tile URLs Django hands it | Keeps auth server-side, keeps frontend simple |
| Async job queue (Celery+Redis)? | **No for MVP.** `getMapId()` is near-instant (lazy tile computation); AOI size caps keep the vectorization step fast enough for a normal HTTP request/response. Revisit only if AOI sizes grow in the future roadmap. | Avoids infra complexity with no demonstrated need |
| PostgreSQL? | **Yes** — for Incident, AnalysisJob, AOI, and a cache table | Needed regardless of Redis decision |
| PostGIS? | **Nice-to-have, not required for MVP.** Store geometry as GeoJSON in a `JSONField`/`TextField` for now; migrate to PostGIS only if you need spatial queries (e.g. "incidents within district X") that a simple bounding-box filter can't handle | Keeps the free Postgres provider simple; Neon/Supabase free tiers may not include PostGIS by default |
| Redis? | **No for MVP.** Use Django's database cache backend (a Postgres table) for the analysis cache described in §8 | One less service, one less free-tier limit to track |
| Docker? | **No for MVP.** Render natively builds Python apps from `requirements.txt`; Docker adds build complexity with no benefit at this scale | Simpler, faster to deploy |
| Sync vs async processing | **Synchronous** `/api/analyze/` request/response, with a hard AOI-size and date-range cap enforced before calling GEE | Matches the "no Celery" decision |

---

## 5. Folder structure

```
forest-monitor/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── render.yaml
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── analysis/
│   │   │   ├── models.py          # AOI, AnalysisJob
│   │   │   ├── serializers.py
│   │   │   ├── views.py           # POST /api/analyze/
│   │   │   ├── urls.py
│   │   │   └── validators.py      # AOI size/date validation
│   │   ├── incidents/
│   │   │   ├── models.py          # Incident
│   │   │   ├── serializers.py
│   │   │   ├── views.py           # GET incidents, GET geojson, POST report
│   │   │   └── urls.py
│   │   └── notifications/
│   │       ├── models.py
│   │       ├── services.py        # email sending wrapper
│   │       └── views.py
│   ├── gee/
│   │   ├── client.py              # ee.Initialize() with service account
│   │   ├── sentinel.py            # collection loading, cloud masking
│   │   ├── ndvi.py                # NDVI calc, delta NDVI
│   │   ├── change_detection.py    # threshold, connected components,
│   │   │                          #   min-area filter, vectorization
│   │   └── tiles.py               # getMapId() wrapper → tile URL template
│   ├── gemini/
│   │   ├── client.py
│   │   └── report_prompt.py       # prompt template, guardrail instructions
│   ├── caching/
│   │   └── cache_keys.py          # AOI+dates+threshold+version → key
│   └── tests/
│       ├── test_gee_pipeline.py
│       ├── test_api_validation.py
│       └── test_gemini_integration.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── map/
│       │   ├── MapView.jsx        # Leaflet map, base layer + EE tile layer
│       │   ├── AoiDrawTool.jsx    # rectangle/polygon draw
│       │   ├── IncidentLayer.jsx  # on-click GeoJSON fetch + popup
│       │   └── IncidentPopup.jsx
│       ├── components/
│       │   ├── Sidebar.jsx        # AOI presets, date pickers, threshold
│       │   ├── LoadingState.jsx
│       │   └── ErrorState.jsx
│       ├── services/
│       │   └── api.js             # fetch wrappers for backend endpoints
│       └── hooks/
│           └── useAnalysis.js
│
├── .gitignore                     # MUST include .env, *.json (GEE key)
└── README.md
```

---

## 6. Backend: models (minimum viable schema)

```
AOI
- id, name (nullable, for presets), geometry (GeoJSON as JSONField)
- max_area_hectares check enforced in validators.py, not just UI

AnalysisJob
- id, aoi (FK), historical_start, historical_end, current_start, current_end
- threshold (float, default configurable, NOT hardcoded)
- algorithm_version (string) — part of the cache key
- status (pending/complete/failed)
- created_at
- cache_key (string, indexed)

Incident
- id, analysis_job (FK)
- geometry (GeoJSON, simplified)
- area_hectares
- ndvi_before, ndvi_after, ndvi_change
- centroid_lat, centroid_lng
- detected_date
- status (default: "requires_verification")

Report
- id, incident (FK)
- generated_text
- created_at

AnalysisCache  (Django DB cache table, or use Django's cache framework
                pointed at the database backend — don't hand-roll this)
```

---

## 7. GEE processing pipeline (what `gee/` must implement)

```
1. client.py: ee.Initialize(credentials from service account JSON env var)
   — never from a file path; parse from env var directly.

2. sentinel.py:
   - Load COPERNICUS/S2_SR_HARMONIZED (or current recommended harmonized
     collection — verify the exact collection ID is still current, GEE
     periodically updates dataset names).
   - Filter by AOI bounds and date range.
   - Cloud-mask using the collection's QA band / cloud probability band
     (use whichever masking approach the collection's own documentation
     currently recommends — don't hardcode an outdated band name).
   - Build a median composite for the historical window and another for
     the current window — NOT a single scene, to reduce noise from one
     cloudy/off day. This is the "robust" approach from the brief,
     chosen over single-scene comparison specifically to cut down
     seasonal/atmospheric false positives.

3. ndvi.py:
   - NDVI = normalizedDifference([NIR_band, RED_band]) — use Earth
     Engine's built-in normalizedDifference rather than hand-writing the
     division (it correctly handles the near-zero-denominator edge case).
   - Compute for both composites, then delta = current − historical.

4. change_detection.py:
   - Apply CONFIGURABLE threshold (default negative delta, e.g. -0.3,
     but exposed as a request parameter, never hardcoded as "the"
     correct value — UI must show whatever threshold was used).
   - connectedPixelCount / connectedComponents to group contiguous
     flagged pixels.
   - Minimum-area filter (CONFIGURABLE, e.g. default 0.5 hectares) to
     drop noise-sized specks.
   - Vectorize the filtered mask to polygons (reduceToVectors).
   - Simplify polygon geometry before returning (this is what keeps
     GeoJSON small — do not skip this step).

5. tiles.py:
   - getMapId() on the *visualization* image (e.g. delta NDVI styled
     red/orange over the flagged threshold) → return
     {tile_url_template, token/expiry info} as plain JSON.
   - This is what the frontend's Leaflet TileLayer points at directly.
```

**Explainability requirement**: every Incident record must store
`ndvi_before`, `ndvi_after`, `ndvi_change`, the `threshold` used, and
`area_hectares` — the popup and the Gemini report both read from these
same stored numbers, so the UI is never showing a number Gemini invented.

---

## 8. Caching strategy

Cache key = `f"{aoi_hash}:{historical_start}:{historical_end}:{current_start}:{current_end}:{threshold}:{algorithm_version}"`

- On `POST /api/analyze/`, compute this key first.
- If a matching `AnalysisJob` with status=complete exists, return its
  stored incidents immediately — do not call GEE again.
- Otherwise run the pipeline, store results, return them.
- Use Django's cache framework with the **database** backend (points at
  a table in the same Postgres you already have) — this satisfies the
  brief's caching requirement without adding Redis.

---

## 9. API design

```
POST /api/analyze/
  body: { aoi: GeoJSON, historical_start, historical_end,
          current_start, current_end, threshold }
  → validates AOI size + date ranges BEFORE touching GEE
  → checks cache (see §8)
  → response: { job_id, status, tile_url_template, incidents: [ {id,
      area_hectares, ndvi_before, ndvi_after, ndvi_change, centroid,
      detected_date, status} ... ] }
  (synchronous — see §4 decision on no async queue)

GET  /api/incidents/{id}/geojson/
  → returns the single simplified polygon for that one incident only
  → this is the "zoomed-in, on-demand vector" step; never return every
    incident's full geometry from the analyze endpoint, only summaries

POST /api/incidents/{id}/generate-report/
  → calls Gemini with the stored structured fields (see §10)
  → stores + returns the report text

POST /api/notifications/
  → optional, sends the report via email

GET  /api/health/
  → trivial endpoint for confirming the service is awake (useful given
    Render's free-tier cold starts, see INSTRUCTIONS.md §5)
```

Validation rules enforced server-side, not just in the UI:
- Max AOI area (CONFIGURABLE constant, pick something the free GEE quota
  can comfortably handle — start conservative, e.g. under a few hundred
  km², and adjust based on actual quota observed during testing).
- Max date range span.
- Threshold must be within a sane numeric bound (e.g. -1.0 to 0).

---

## 10. Gemini integration rules

Input to Gemini must be **only the structured incident JSON already
computed by the deterministic pipeline** — never raw imagery, never let
Gemini see anything it could use to invent a number.

System-style instruction to bake into every report prompt:
- Never state or imply that the detected change is confirmed illegal
  activity.
- Never invent coordinates, dates, or figures beyond what's provided.
- Always explicitly state that field verification is required.
- Summarize: location description (from centroid + AOI name if
  available), area affected, NDVI change with plain-language
  explanation, detection date, and 2-3 concrete recommended verification
  actions (e.g. "cross-check against FRA/land records for this
  coordinate," "schedule a field visit").
- Keep the output length reasonable (a short structured report, not an
  essay) — this keeps both Gemini latency and free-tier token usage low.

Handle Gemini failures gracefully: if the API call fails or times out,
return the structured data as a fallback plain-text summary rather than
leaving the user with an error and nothing else.

---

## 11. Frontend requirements

- `MapView.jsx`: renders a normal basemap (e.g. OpenStreetMap or Esri
  satellite tiles — both free, no key needed for reasonable hackathon
  traffic) PLUS an `L.tileLayer` pointed at whatever `tile_url_template`
  the backend returns after analysis. These are two separate Leaflet
  layers, togglable.
- `AoiDrawTool.jsx`: rectangle/polygon draw (leaflet-draw or
  react-leaflet-draw), plus a few preset AOIs (e.g. named districts) so
  the demo doesn't depend on live drawing working perfectly.
- `IncidentLayer.jsx`: on marker/polygon click, fetch
  `/api/incidents/{id}/geojson/` (not the whole dataset) and render just
  that polygon at full detail — this is the "zoomed-in vector" behavior.
- `IncidentPopup.jsx`: shows area, before/after NDVI, delta, threshold
  used, date, status, and a "Generate Report" button.
- Loading and error states are required for every async action — the
  brief explicitly calls out needing graceful handling of GEE/Gemini
  failures and slow responses (relevant given Render cold starts).
- API base URL comes from `VITE_API_BASE_URL` env var, never hardcoded.

---

## 12. Security rules (non-negotiable)

- GEE service account JSON and Gemini API key: environment variables
  only, read server-side, never sent to or readable by the frontend.
- `CORS_ALLOWED_ORIGINS` explicitly lists the Vercel domain — never
  `CORS_ALLOW_ALL_ORIGINS = True` outside of local debugging, and that
  must not ship to the deployed config.
- CSRF: since this is a token/stateless API consumed by a separate
  frontend origin, use DRF's standard API authentication approach rather
  than session+CSRF; keep whatever auth exists (even if it's minimal for
  the hackathon) out of the URL/query string.
- All secrets live in Render's/Vercel's environment variable dashboards
  in production, and in a git-ignored `.env` locally. `.env.example`
  (checked into git) lists variable NAMES only, never real values.
- Rate-limit `/api/analyze/` and `/generate-report/` at the Django level
  (even a simple per-IP throttle via DRF's throttling classes) so one
  script kiddie or one accidental frontend loop can't burn your GEE/
  Gemini quota during the demo window.

---

## 13. Testing requirements

- `gee/` module: test with a small, fixed, known AOI — assert NDVI
  values are within an expected numeric range, assert cloud-masked
  pixels are excluded, assert threshold+min-area filtering actually
  drops small regions.
- API layer: oversized AOI is rejected with a clear error, invalid date
  ranges are rejected, GEE exceptions are caught and returned as a
  clean 502-style error (not a stack trace), same for Gemini failures.
- Frontend: map loads with no AOI selected, loading state shows during
  analysis, error state shows on a simulated API failure, clicking an
  incident triggers exactly one GeoJSON fetch (not a re-fetch of
  everything).

---

## 14. Deployment

**Backend → Render**
- Root: `backend/`
- Build: `pip install -r requirements.txt && python manage.py migrate`
- Start: `gunicorn config.wsgi:application`
- Env vars: from INSTRUCTIONS.md §7, entered in Render's dashboard.
- Health check path: `/api/health/`

**Frontend → Vercel**
- Root: `frontend/`
- Framework preset: Vite
- Env var: `VITE_API_BASE_URL` pointing at the Render backend's public URL.

**Database → Neon or Supabase**
- Connection string goes into `DATABASE_URL` on Render only (frontend
  never touches the database directly).

No Dockerfile is required per the §4 decision; if Antigravity's default
scaffolding wants to add one anyway, keep it optional/unused rather than
making it the deploy path.

---

## 15. MVP scope vs. future roadmap

**In scope for the hackathon MVP:**
- Manual/preset AOI selection, one historical vs. one current window
- NDVI delta + threshold + connected-component + min-area filtering
- Tile-URL-direct-to-browser visualization + on-demand incident GeoJSON
- Incident popup with explainable numbers
- One-click Gemini report generation
- Basic caching (database-backed)
- Deployed, working demo on Render + Vercel

**Explicitly future work — do not build now:**
- Sentinel-1/SAR integration for cloud-heavy periods
- Any ML-based classification
- Automated recurring monitoring/alerting (cron-triggered re-analysis)
- PostGIS-backed spatial queries across many AOIs
- Multi-user roles/permissions beyond a single demo login
- Async job queue (revisit if AOI sizes or user counts grow)

---

## 16. Explicit "do not" list

- Do not download or store raw Sentinel-2 imagery on the backend or in
  the database, at any point.
- Do not return a full-resolution GeoJSON for an entire AOI in one
  response — only per-incident, on click.
- Do not claim a specific bandwidth-reduction percentage or exact
  latency number in demo materials without having actually measured it
  in your own deployed environment.
- Do not hardcode the NDVI threshold or minimum-area value as "the"
  correct scientific figure — both are configurable parameters with
  defaults, and the UI should show whichever values were actually used
  for a given analysis.
- Do not let Gemini's output be the only place a number "lives" — every
  figure Gemini mentions must trace back to a field already stored on
  the Incident model.
- Do not add Celery, Redis, Docker-as-the-deploy-path, or Cloud
  Run/Storage/SQL unless a concrete, observed limitation during actual
  development requires it — and if you do add one, update this file to
  explain why, so the decision is documented rather than silently
  drifted into.
