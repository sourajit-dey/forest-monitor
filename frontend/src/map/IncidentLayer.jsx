import React from 'react';
import { Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import IncidentPopup from './IncidentPopup';

// Custom Apple-styled SVG Incident Marker
const createIncidentIcon = (areaHa, isSelected) => {
  const size = isSelected ? 36 : 28;
  const pulseClass = isSelected ? 'animate-ping' : '';
  const bgColor = isSelected ? '#b30000' : '#e34a33';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${isSelected ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(227, 74, 51, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="
        width: ${size - 6}px;
        height: ${size - 6}px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 700;
        font-size: ${isSelected ? 11 : 9}px;
        font-family: -apple-system, sans-serif;
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
            icon={createIncidentIcon(incident.area_hectares, isSelected)}
            eventHandlers={{
              click: () => {
                onSelectIncident(incident);
              },
            }}
          >
            <Popup className="apple-incident-popup">
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
            color: '#b30000',
            weight: 3,
            opacity: 0.95,
            fillColor: '#fc8d59',
            fillOpacity: 0.45,
            dashArray: '4, 4',
          }}
        />
      )}
    </>
  );
}
