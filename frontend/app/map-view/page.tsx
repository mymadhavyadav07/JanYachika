"use client"

import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import ShinyText from "@/components/blocks/TextAnimations/ShinyText/ShinyText";
import { useState, useEffect, useRef } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { apiBaseUrl } from '@/data/data';
import CitySearch from '@/components/CitySearch';

const HeatmapMap = dynamic(() => import('@/components/HeatMap'), { ssr: false });

interface MapData {
  coordinates: [number, number, number][];
  metadata: {
    total_issues: number;
    issues_with_coordinates: number;
    center: [number, number] | null;
  };
  message: string;
}

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function MapView() {
  const [isMounted, setIsMounted] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const router = useRouter();
    
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
 
        const authRes = await fetch(`${apiBaseUrl}/me`, {
          credentials: 'include',
        });

        if (authRes.status === 401) {
          console.log("Unauthorized. Redirecting to login...");
          redirect("/login");
          return;
        }

        if (!authRes.ok) {
          throw new Error(`Auth error: ${authRes.status}`);
        }

        const mapRes = await fetch(`${apiBaseUrl}/map-view`, {
          credentials: 'include',
        });

        if (!mapRes.ok) {
          throw new Error(`Failed to fetch map data: ${mapRes.status}`);
        }

        const mapData: MapData = await mapRes.json();
        console.log('Map data received:', mapData);
        
        setMapData(mapData);
        setIsMounted(true);
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to load map data");
        setLoading(false);
        redirect("/login")

        // if (err instanceof Error && err.message.includes('401')) {
        //   redirect("/login");
        // }
      }
    };

    fetchData();
  }, [router]);

  const handleCitySelect = (city: City) => {
    if (mapInstance) {
      mapInstance.setView([city.latitude, city.longitude], 12, {
        animate: true,
        duration: 1.5
      });
    }
  };


  const handleMapReady = (map: any) => {
    setMapInstance(map);
  };


  if (loading) {
    return (
      <div className="relative flex flex-col mt-16">
        <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center h-[65%] mb-[5rem]" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          }}>
            <div className="flex justify-center">
              <ShinyText 
                text="Loading Heatmap..." 
                disabled={false} 
                speed={3} 
                className='text-3xl font-normal mb-5' 
              />
            </div>
            <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading map data...</div>
              </div>   
            </div>
        </Card>
      </div>
    );
  }


  if (error) {
    return (
      <div className="relative flex flex-col mt-16">
        <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center h-[65%] mb-[5rem]" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          }}>
            <div className="flex justify-center">
              <ShinyText 
                text="Error Loading Map" 
                disabled={false} 
                speed={3} 
                className='text-3xl font-normal mb-5 text-red-500' 
              />
            </div>
            <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>   
            </div>
        </Card>
      </div>
    );
  }

  if (!mapData || !mapData.coordinates || mapData.coordinates.length === 0) {
    return (
      <div className="relative flex flex-col mt-16">
        <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center h-[65%] mb-[5rem]" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          }}>
            <div className="flex justify-center">
              <ShinyText 
                text="Heatmap View" 
                disabled={false} 
                speed={3} 
                className='text-3xl font-normal mb-5' 
              />
            </div>
            <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">No issues with location data found</div>
              </div>   
            </div>
        </Card>
      </div>
    );
  }


  const mapCenter: [number, number] = mapData.metadata.center || [20.5937, 78.9629]; 
  

  let mapZoom: number;
  if (mapData.coordinates.length > 50) {
    mapZoom = 5; 
  } else if (mapData.coordinates.length > 20) {
    mapZoom = 6; 
  } else if (mapData.coordinates.length > 5) {
    mapZoom = 8; 
  } else {
    mapZoom = 10;
  }

  return (
    <div className="relative flex flex-col mt-16">
      <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center h-[65%] mb-[5rem]" 
        style={{background: "transparent",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        }}>
          <div className="flex justify-center">
            <ShinyText 
              text="Issues Heatmap" 
              disabled={false} 
              speed={3} 
              className='text-3xl font-normal mb-5' 
            />
          </div>
          
          {/* City Search Bar */}
          <div className="flex justify-center mb-4">
            <CitySearch 
              onCitySelect={handleCitySelect}
              className="w-full max-w-md"
            />
          </div>
          
          {/* Display metadata */}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>Total Issues: {mapData.metadata.total_issues}</span>
            <span>•</span>
            <span>With Coordinates: {mapData.metadata.issues_with_coordinates}</span>
          </div>
          
          <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
           <div className="w-full h-full">
              <HeatmapMap 
                points={mapData.coordinates} 
                center={mapCenter} 
                zoom={mapZoom} 
                onMapReady={handleMapReady}
              />
          </div>   
          </div>
      </Card>
    </div>
  );

}