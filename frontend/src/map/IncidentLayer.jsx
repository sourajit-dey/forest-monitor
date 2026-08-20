import React from 'react';
import { Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import IncidentPopup from './IncidentPopup';

// Custom Binance-styled SVG Incident Marker (trading-red = detected loss)
const createIncidentIcon = (areaHa, isSelected, showRiskLayer, predictedClass) => {
  const size = isSelected ? 38 : 30;
  const isModerate = showRiskLayer && predictedClass === 'Moderate';
  const isHigh = showRiskLayer && predictedClass === 'High Risk';

  const bgColor = showRiskLayer
    ? (isHigh ? '#f6465d' : isModerate ? '#fcd535' : '#f6465d')
    : '#f6465d';
  const textColor = bgColor === '#fcd535' ? '#181a20' : '#ffffff';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${isSelected ? `<div class="bnb-marker-ping" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(246, 70, 93, 0.35);"></div>` : ''}
      <div style="
        width: ${size - 5}px;
        height: ${size - 5}px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${textColor};
        font-weight: 700;
        font-size: ${isSelected ? 12 : 10}px;
        font-family: Inter, -apple-system, sans-serif;
      ">
        !
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-incident-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export default function IncidentLayer({
  incidents,
  selectedIncident,
  selectedIncidentGeoJSON,
  threshold,
  onSelectIncident,
  onGenerateReport,
  onOpenEmailModal,
  isGeneratingReport,
  showRiskLayer,
}) {
  if (!incidents || incidents.length === 0) return null;

  return (
    <>
      {/* Centroid Point Markers */}
      {incidents.map((incident) => {
        const isSelected = selectedIncident?.id === incident.id;
        const position = [incident.centroid_lat, incident.centroid_lng];

        return (
          <Marker
            key={`marker-${incident.id}`}
            position={position}
            icon={createIncidentIcon(incident.area_hectares, isSelected, showRiskLayer, incident.predicted_class)}
            eventHandlers={{
              click: () => {
                onSelectIncident(incident);
              },
            }}
          >
            <Popup className="bnb-incident-popup">
              <IncidentPopup
                incident={incident}
                threshold={threshold}
                onGenerateReport={onGenerateReport}
                onOpenEmailModal={onOpenEmailModal}
                isGeneratingReport={isGeneratingReport}
              />
            </Popup>
          </Marker>
        );
      })}

      {/* On-Demand Single Incident Polygon Layer */}
      {selectedIncidentGeoJSON && (
        <GeoJSON
          key={`geojson-${selectedIncident?.id}-${Date.now()}`}
          data={selectedIncidentGeoJSON}
          style={{
            color: '#f6465d',
            weight: 3,
            opacity: 0.95,
            fillColor: '#fc8d59',
            fillOpacity: 0.4,
            dashArray: '4, 4',
          }}
        />
      )}
    </>
  );
}