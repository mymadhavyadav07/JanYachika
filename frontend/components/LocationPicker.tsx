'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  LayersControl
} from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

type Props = {
  onLocationSelect: (lat: number, lng: number) => void;
};

function LocationMarker({ position }: { position: L.LatLng | null }) {
  return position ? <Marker position={position} /> : null;
}

function SearchBar({
  onResult,
}: {
  onResult: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const map = useMap();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1`;

    try {
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      const data = await res.json();

      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.setView([lat, lon], 14);
        onResult(lat, lon);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute z-[1000] top-3 left-15 flex gap-2 bg-white p-2 rounded shadow">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a place"
        className="w-[200px] text-black"

      />
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  );
}

export default function OSMLocationPicker({ onLocationSelect }: Props) {
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);

  function ClickHandler() {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const handleSearchResult = (lat: number, lng: number) => {
    const newPosition = L.latLng(lat, lng);
    setMarkerPosition(newPosition);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="relative w-full h-[600px]">
      
      <MapContainer
  center={[55, 55]}
  zoom={18}
  maxZoom={22}
  style={{ height: '100%', width: '100%' }}
>
  <SearchBar onResult={handleSearchResult} />

  <LayersControl position="topright">
    <LayersControl.BaseLayer checked name="Hybrid (Esri)">
      <>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={23}
        />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
          maxZoom={23}
          zIndex={1000}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
          maxZoom={23}
          zIndex={1001}
        />
      </>
    </LayersControl.BaseLayer>

 
    <LayersControl.BaseLayer name="OpenStreetMap">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
        maxZoom={19}
      />
    </LayersControl.BaseLayer>
  </LayersControl>


  <ClickHandler />
  <LocationMarker position={markerPosition} />
</MapContainer>

    </div>
  );
}
