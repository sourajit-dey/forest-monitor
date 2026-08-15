import React, { useState, useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { PenTool, Square, X, Check } from 'lucide-react';

export default function AoiDrawTool({ isDrawing, setIsDrawing, onCustomAoiCreated }) {
  const map = useMap();
  const [startPoint, setStartPoint] = useState(null);
  const [tempRect, setTempRect] = useState(null);

  useMapEvents({
    mousedown(e) {
      if (!isDrawing) return;
      map.dragging.disable();
      setStartPoint(e.latlng);
    },
    mousemove(e) {
      if (!isDrawing || !startPoint) return;
      const bounds = L.latLngBounds(startPoint, e.latlng);

      if (tempRect) {
        tempRect.setBounds(bounds);
      } else {
        const rect = L.rectangle(bounds, {
          color: '#0066cc',
          weight: 2,
          fillColor: '#0066cc',
          fillOpacity: 0.15,
          dashArray: '6, 6',
        }).addTo(map);
        setTempRect(rect);
      }
    },
    mouseup(e) {
      if (!isDrawing || !startPoint) return;
      map.dragging.enable();

      const endPoint = e.latlng;
      const minLat = Math.min(startPoint.lat, endPoint.lat);
      const maxLat = Math.max(startPoint.lat, endPoint.lat);
      const minLng = Math.min(startPoint.lng, endPoint.lng);
      const maxLng = Math.max(startPoint.lng, endPoint.lng);

      // Require minimal area drag to avoid accidental clicks
      if (Math.abs(maxLat - minLat) > 0.005 && Math.abs(maxLng - minLng) > 0.005) {
        const customPolygonGeoJSON = {
          type: 'Polygon',
          coordinates: [[
            [minLng, minLat],
            [maxLng, minLat],
            [maxLng, maxLat],
            [minLng, maxLat],
            [minLng, minLat],
          ]],
        };

        onCustomAoiCreated(customPolygonGeoJSON, "Custom Drawn Bounding Box");
      }

      if (tempRect) {
        map.removeLayer(tempRect);
        setTempRect(null);
      }
      setStartPoint(null);
      setIsDrawing(false);
    },
  });

  // Clean up if drawing is cancelled
  useEffect(() => {
    if (!isDrawing && tempRect) {
      map.removeLayer(tempRect);
      setTempRect(null);
      setStartPoint(null);
      map.dragging.enable();
    }
  }, [isDrawing, map, tempRect]);

  return null;
}
