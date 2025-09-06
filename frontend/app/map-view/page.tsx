"use client"

import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import ShinyText from "@/components/blocks/TextAnimations/ShinyText/ShinyText";
import { useState, useEffect } from 'react';

const HeatmapMap = dynamic(() => import('@/components/HeatMap'), { ssr: false });

export default function MapView() {
    const coords: [number, number, number][] = [
    [37.7749, -122.4194, 0.5],
    [37.775, -122.4195, 0.5],
    [37.776, -122.418, 0.8],
    [37.77, -122.42, 0.5],
  ];

  const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
          setIsMounted(true);
      }, []);


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
             <div className="w-full h-full">
                
                <HeatmapMap points={coords} center={[37.77, -122.42]} zoom={15} />
            </div>   
            </div>
      
            
            
            
        </Card>
        </div>
        

    )



}