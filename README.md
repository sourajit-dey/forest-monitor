# Forest Monitoring & Illegal Land-Use Detection WebGIS

> A high-performance, cost-free WebGIS utilizing Sentinel-2 satellite imagery and deterministic NDVI change detection to flag areas of **potential vegetation loss** for forest department field verification.

---

## 🌟 Key Features

1. **Zero-Cost & Free-Tier Native**:
   - **Frontend**: React + Leaflet hosted on Vercel.
   - **Backend**: Django + Django REST Framework on Render.
   - **Database**: PostgreSQL (Neon / Supabase) with SQLite local dev fallback.
   - **Earth Engine**: Community / Non-commercial tier via Python API (`earthengine-api`).
   - **AI Synthesis**: Google Gemini 1.5 Flash API for field officer verification advisories.

2. **Tile-Bypass Architecture**:
   - Raw satellite rasters never pass through Django or consume backend bandwidth.
   - Django uses `ee.Image.getMapId()` to generate signed tile URL templates directly consumed by Leaflet (`L.tileLayer`).
   - Only lightweight JSON metadata and on-demand per-incident simplified GeoJSON pass through the backend.

3. **Deterministic Remote Sensing Pipeline**:
   - Sentinel-2 Surface Reflectance (`COPERNICUS/S2_SR_HARMONIZED`).
   - Cloud masking with SCL / QA bands.
   - Dual median composite generation (Historical Baseline vs. Monitoring Window) to eliminate false positives from single cloudy scenes.
   - Normalized Difference Vegetation Index (NDVI) differencing (`current - historical`).
   - Configurable sensitivity threshold (default `-0.30`) & minimum cluster area filter (default `0.5 ha`).
   - Connected-pixel component grouping and polygon vectorization.

4. **Strict Guardrails & Explainable AI**:
   - Enforces *"potential vegetation loss"*, *"detected vegetation-loss area"*, and *"requires field verification"*; never claims *"illegal deforestation"* or *"confirmed"*.
   - Gemini reports are strictly grounded on deterministic telemetry numbers already computed by the pipeline.

5. **Apple-Inspired UI Design System**:
   - Action Blue (`#0066cc`), pure parchment (`#f5f5f7`), and dark slate palettes.
   - SF Pro / Inter typography with negative tracking on display headlines.
   - Full pill action buttons with `scale(0.95)` micro-interactions.
   - Frosted glass navigation bars (`backdrop-filter: saturate(180%) blur(20px)`).

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createcachetable
python manage.py runserver 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🧪 Testing

Run backend tests:

```bash
cd backend
python manage.py test
```

Build production frontend:

```bash
cd frontend
npm run build
```
