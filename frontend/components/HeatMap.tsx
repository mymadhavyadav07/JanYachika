'use client';

import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

type LatLngTuple = [number, number];
type HeatPoint = LatLngTuple | [...LatLngTuple, number]; // optional intensity

interface HeatmapProps {
  points: HeatPoint[]; // e.g., [ [lat, lng], [lat, lng, intensity] ]
  center?: LatLngTuple;
  zoom?: number;
  onMapReady?: (map: L.Map) => void;
}

const HeatmapLayer: React.FC<{ points: HeatPoint[] }> = ({ points }) => {
  const map = useMap();
  const [heatLayer, setHeatLayer] = React.useState<any>(null);

  React.useEffect(() => {
    // Remove existing layer if it exists
    if (heatLayer) {
      map.removeLayer(heatLayer);
    }

    // Create new heat layer with enhanced settings
    const newHeatLayer = (L as any).heatLayer(points, {
      radius: 35,        // Increased from 25 to 35 for better visibility
      blur: 20,          // Increased from 15 to 20 for smoother gradients
      maxZoom: 18,       // Increased maxZoom for better scaling
      minOpacity: 0.4,   // Minimum opacity to ensure visibility
      max: 1.0,          // Maximum point intensity
      gradient: {        // Custom gradient for better contrast
        0.0: '#000080',  // Dark blue for low intensity
        0.2: '#0000FF',  // Blue
        0.4: '#00FFFF',  // Cyan
        0.6: '#00FF00',  // Green
        0.8: '#FFFF00',  // Yellow
        1.0: '#FF0000'   // Red for high intensity
      }
    }).addTo(map);

    setHeatLayer(newHeatLayer);

    // Add zoom event listener to dynamically adjust radius
    const onZoomEnd = () => {
      const currentZoom = map.getZoom();
      let dynamicRadius;
      
      // Adjust radius based on zoom level
      if (currentZoom <= 6) {
        dynamicRadius = 50;  // Large radius for country/continent view
      } else if (currentZoom <= 10) {
        dynamicRadius = 40;  // Medium radius for state/region view
      } else if (currentZoom <= 13) {
        dynamicRadius = 35;  // Default radius for city view
      } else {
        dynamicRadius = 30;  // Smaller radius for detailed view
      }

      // Update the heat layer with new radius
      if (newHeatLayer) {
        map.removeLayer(newHeatLayer);
        const updatedLayer = (L as any).heatLayer(points, {
          radius: dynamicRadius,
          blur: Math.max(15, dynamicRadius * 0.5),
          maxZoom: 18,
          minOpacity: 0.4,
          max: 1.0,
          gradient: {
            0.0: '#000080',
            0.2: '#0000FF',
            0.4: '#00FFFF',
            0.6: '#00FF00',
            0.8: '#FFFF00',
            1.0: '#FF0000'
          }
        }).addTo(map);
        setHeatLayer(updatedLayer);
      }
    };

    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('zoomend', onZoomEnd);
      if (newHeatLayer) {
        map.removeLayer(newHeatLayer);
      }
    };
  }, [map, points]);

  return null;
};

// Component to handle map instance
const MapController: React.FC<{ onMapReady?: (map: L.Map) => void }> = ({ onMapReady }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (onMapReady && map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

const HeatmapMap: React.FC<HeatmapProps> = ({
  points,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 13,
  onMapReady,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '1000px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer points={points} />
      <MapController onMapReady={onMapReady} />
    </MapContainer>
  );
};

export default HeatmapMap;
