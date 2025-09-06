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
}

const HeatmapLayer: React.FC<{ points: HeatPoint[] }> = ({ points }) => {
  const map = useMap();

  React.useEffect(() => {
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const HeatmapMap: React.FC<HeatmapProps> = ({
  points,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 13,
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
    </MapContainer>
  );
};

export default HeatmapMap;
