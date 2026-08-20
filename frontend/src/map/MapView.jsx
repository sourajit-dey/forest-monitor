import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Layers, PenTool, Crosshair, ShieldAlert } from 'lucide-react';
import IncidentLayer from './IncidentLayer';
import AoiDrawTool from './AoiDrawTool';

// Dismisses the AOI boundary box when the user clicks outside it on the map
function AoiClickDismiss({ aoi, isVisible, isDrawing, onDismiss }) {
  useMapEvents({
    click(e) {
      if (!isVisible || isDrawing || !aoi) return;
      try {
        const layer = L.geoJSON(aoi);
        const bounds = layer.getBounds();
        if (bounds.isValid() && !bounds.contains(e.latlng)) {
          onDismiss();
        }
      } catch (err) {
        console.error("Error checking AOI bounds:", err);
      }
    },
  });
  return null;
}

// Helper component to smoothly center and fit bounds when AOI changes
function MapController({ aoi, selectedPreset }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPreset?.center && selectedPreset?.zoom) {
      map.flyTo(selectedPreset.center, selectedPreset.zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    } else if (aoi) {
      try {
        const geojsonLayer = L.geoJSON(aoi);
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1.2,
          });
        }
      } catch (err) {
        console.error("Error centering map to AOI:", err);
      }
    }
  }, [aoi, selectedPreset, map]);

  return null;
}

export default function MapView({
  aoi,
  aoiName,
  selectedPreset,
  tileUrlTemplate,
  incidents,
  selectedIncident,
  selectedIncidentGeoJSON,
  threshold,
  onSelectIncident,
  onGenerateReport,
  onOpenEmailModal,
  onCustomAoiCreated,
  isGeneratingReport,
  isDrawingAoi,
  setIsDrawingAoi,
}) {
  const [baseMap, setBaseMap] = useState('satellite'); // 'satellite' | 'dark'
  const [aoiBoxHidden, setAoiBoxHidden] = useState(false);
  const [showAnalysisLayer, setShowAnalysisLayer] = useState(true);
  const [showRiskLayer, setShowRiskLayer] = useState(false);

  // Re-show the AOI boundary whenever a new area of interest is chosen/drawn
  useEffect(() => {
    setAoiBoxHidden(false);
  }, [aoi]);

  const showAoiBoundary = Boolean(aoi) && !tileUrlTemplate && !aoiBoxHidden;

  const baseMapUrls = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap contributors',
      maxZoom: 19,
    },
  };

  const initialCenter = selectedPreset?.center || [21.95, 88.90];
  const initialZoom = selectedPreset?.zoom || 11;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full z-0 bg-bnb-canvas-dark"
        zoomControl={false}
      >
        <MapController aoi={aoi} selectedPreset={selectedPreset} />

        {/* Base Layer */}
        <TileLayer
          key={baseMap}
          url={baseMapUrls[baseMap].url}
          attribution={baseMapUrls[baseMap].attribution}
          maxZoom={baseMapUrls[baseMap].maxZoom}
        />

        {/* Dynamic GEE TileLayer (NDVI Change Detection) — togglable */}
        {tileUrlTemplate && showAnalysisLayer && (
          <TileLayer
            key={`gee-tiles-${tileUrlTemplate}`}
            url={tileUrlTemplate}
            opacity={0.85}
            zIndex={20}
          />
        )}

        {/* Active AOI Boundary Polygon (hidden once analysis results are displayed or dismissed) */}
        {showAoiBoundary && (
          <GeoJSON
            key={`aoi-boundary-${JSON.stringify(aoi)}`}
            data={aoi}
            style={{
              color: '#fcd535',
              weight: 2.5,
              opacity: 0.9,
              fillColor: '#fcd535',
              fillOpacity: 0.05,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Click-outside-to-dismiss listener for the AOI boundary box */}
        <AoiClickDismiss
          aoi={aoi}
          isVisible={showAoiBoundary}
          isDrawing={isDrawingAoi}
          onDismiss={() => setAoiBoxHidden(true)}
        />

        {/* Interactive Incidents Layer */}
        <IncidentLayer
          incidents={incidents}
          selectedIncident={selectedIncident}
          selectedIncidentGeoJSON={selectedIncidentGeoJSON}
          threshold={threshold}
          onSelectIncident={onSelectIncident}
          onGenerateReport={onGenerateReport}
          onOpenEmailModal={onOpenEmailModal}
          isGeneratingReport={isGeneratingReport}
          showRiskLayer={showRiskLayer}
        />

        {/* Custom Bounding Box / Polygon Drawing Listener */}
        <AoiDrawTool
          isDrawing={isDrawingAoi}
          setIsDrawing={setIsDrawingAoi}
          onCustomAoiCreated={onCustomAoiCreated}
        />

        {/* Dark Binance-styled zoom control */}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Floating Basemap & Draw Controls */}
      <div className="absolute top-20 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => setBaseMap(baseMap === 'satellite' ? 'dark' : 'satellite')}
          className={`px-3 py-2.5 rounded-md border transition-all active:scale-95 flex items-center gap-2 text-xs font-medium shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
            baseMap === 'dark'
              ? 'bg-bnb-primary text-bnb-ink border-bnb-primary'
              : 'bg-bnb-card text-bnb-body hover:bg-bnb-elevated border-bnb-hairline-dark'
          }`}
          title="Toggle Base Map"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">
            {baseMap === 'satellite' ? 'Esri Satellite' : 'Dark Map'}
          </span>
        </button>

        <button
          onClick={() => setIsDrawingAoi(!isDrawingAoi)}
          className={`px-3 py-2.5 rounded-md border transition-all active:scale-95 flex items-center gap-2 text-xs font-medium shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
            isDrawingAoi
              ? 'bg-bnb-primary text-bnb-ink border-bnb-primary'
              : 'bg-bnb-card text-bnb-body hover:bg-bnb-elevated border-bnb-hairline-dark'
          }`}
          title="Draw Custom AOI Box on Map"
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isDrawingAoi ? 'Drawing active' : 'Draw AOI Box'}
          </span>
        </button>

        <button
          onClick={() => setShowRiskLayer(!showRiskLayer)}
          className={`px-3 py-2.5 rounded-md border transition-all active:scale-95 flex items-center gap-2 text-xs font-medium shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${
            showRiskLayer
              ? 'bg-bnb-primary text-bnb-ink border-bnb-primary'
              : 'bg-bnb-card text-bnb-body hover:bg-bnb-elevated border-bnb-hairline-dark'
          }`}
          title="Toggle Predicted Risk Zones Layer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span className="hidden sm:inline">Predicted Risk</span>
        </button>
      </div>

      {/* Active Drawing Guide Prompt */}
      {isDrawingAoi && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-bnb-card border border-bnb-hairline-dark text-bnb-body px-5 py-2.5 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] text-xs font-medium flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-bnb-primary" />
          Click and drag a rectangle to define the monitoring area
        </div>
      )}

      {/* Map Legend (Bottom Left so it clears the zoom control) */}
      <div className="absolute bottom-6 left-6 z-10 bg-bnb-card border border-bnb-hairline-dark p-4 rounded-xl text-xs text-bnb-body max-w-xs pointer-events-auto shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="font-semibold text-xs mb-2.5 flex items-center justify-between gap-6 text-bnb-body">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-bnb-primary"></span>
            Sentinel-2 spectral legend
          </span>
          {tileUrlTemplate && (
            <button
              onClick={() => setShowAnalysisLayer(!showAnalysisLayer)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2 py-1 border transition-all ${
                showAnalysisLayer
                  ? 'bg-bnb-primary text-bnb-ink border-bnb-primary'
                  : 'bg-bnb-elevated text-bnb-muted border-bnb-hairline-dark'
              }`}
            >
              <span className={`w-2 h-2 rounded-sm ${showAnalysisLayer ? 'bg-bnb-ink' : 'bg-bnb-muted'}`}></span>
              Analysis layer {showAnalysisLayer ? 'on' : 'off'}
            </button>
          )}
        </div>
        <div className="space-y-2 text-[11px] text-bnb-muted">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-bnb-trading-down border border-black/20"></span>
            <span>Detected vegetation-loss zone (Δ NDVI)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm border-2 border-dashed border-bnb-primary bg-bnb-primary/10"></span>
            <span>Monitoring AOI boundary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-[#fc8d59] border border-black/20"></span>
            <span>Moderate loss (Δ near threshold)</span>
          </div>
        </div>
      </div>
    </div>
  );
}