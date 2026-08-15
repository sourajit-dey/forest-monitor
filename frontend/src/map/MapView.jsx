import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, PenTool, Crosshair, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import IncidentLayer from './IncidentLayer';
import AoiDrawTool from './AoiDrawTool';

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
  const [baseMap, setBaseMap] = useState('satellite'); // 'satellite' | 'street'

  const baseMapUrls = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
    street: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
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
        className="w-full h-full z-0 bg-[#1d1d1f]"
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

        {/* Dynamic GEE TileLayer (NDVI Change Detection) */}
        {tileUrlTemplate && (
          <TileLayer
            key={`gee-tiles-${tileUrlTemplate}`}
            url={tileUrlTemplate}
            opacity={0.85}
            zIndex={20}
          />
        )}

        {/* Active AOI Boundary Polygon (hidden once analysis results are displayed) */}
        {aoi && !tileUrlTemplate && (
          <GeoJSON
            key={`aoi-boundary-${JSON.stringify(aoi)}`}
            data={aoi}
            style={{
              color: '#0066cc',
              weight: 2.5,
              opacity: 0.9,
              fillColor: '#0066cc',
              fillOpacity: 0.08,
              dashArray: '5, 5',
            }}
          />
        )}

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
        />

        {/* Custom Bounding Box / Polygon Drawing Listener */}
        <AoiDrawTool
          isDrawing={isDrawingAoi}
          setIsDrawing={setIsDrawingAoi}
          onCustomAoiCreated={onCustomAoiCreated}
        />
      </MapContainer>

      {/* Floating Basemap & Draw Controls */}
      <div className="absolute top-20 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => setBaseMap(baseMap === 'satellite' ? 'street' : 'satellite')}
          className="px-3 py-2.5 bg-white/90 backdrop-blur-md text-[#1d1d1f] hover:bg-white rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-black/5 transition-all active:scale-95 flex items-center gap-2 text-xs font-medium"
          title="Toggle Base Map"
        >
          <Layers className="w-4 h-4 text-[#0066cc]" />
          <span className="hidden sm:inline">
            {baseMap === 'satellite' ? 'Esri Satellite' : 'Street Map'}
          </span>
        </button>

        <button
          onClick={() => setIsDrawingAoi(!isDrawingAoi)}
          className={`px-3 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] border transition-all active:scale-95 flex items-center gap-2 text-xs font-medium backdrop-blur-md ${
            isDrawingAoi
              ? 'bg-[#0066cc] text-white border-[#0066cc]'
              : 'bg-white/90 text-[#1d1d1f] hover:bg-white border-black/5'
          }`}
          title="Draw Custom AOI Box on Map"
        >
          <PenTool className={`w-4 h-4 ${isDrawingAoi ? 'text-white' : 'text-[#0066cc]'}`} />
          <span className="hidden sm:inline">
            {isDrawingAoi ? 'Drawing active' : 'Draw AOI Box'}
          </span>
        </button>
      </div>

      {/* Active Drawing Guide Prompt */}
      {isDrawingAoi && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-[#1d1d1f]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg border border-white/10 text-xs font-medium flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#2997ff]" />
          Click and drag a rectangle to define the monitoring area
        </div>
      )}

      {/* Map Legend (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-lg text-xs text-[#1d1d1f] max-w-xs pointer-events-auto">
        <div className="font-semibold text-xs mb-2.5 flex items-center gap-1.5 text-[#1d1d1f]">
          <span className="w-2 h-2 rounded-full bg-[#0066cc]"></span>
          Sentinel-2 spectral legend
        </div>
        <div className="space-y-2 text-[11px] text-[#333333]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#b30000] border border-black/10"></span>
            <span>Severe loss (ΔNDVI ≤ −0.40)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#fc8d59] border border-black/10"></span>
            <span>Moderate loss (ΔNDVI ≤ −0.30)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-[#0066cc] bg-[#0066cc]/10"></span>
            <span>Monitoring AOI boundary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
