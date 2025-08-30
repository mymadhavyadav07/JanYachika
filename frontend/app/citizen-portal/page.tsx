"use client"

import DotGrid from "@/components/blocks/Backgrounds/DotGrid/DotGrid";




import { Issue } from "@/components/issue";
import Header from "@/components/header";
import Footer from "@/components/footer";


export default function CitizenPortal() {
  
  
  
  return (
    <div className="fixed w-full h-screen">
      <DotGrid
        dotSize={5}
        gap={15}
        baseColor="#271E37"
        activeColor="#5227FF"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
        style={{padding:0}}
      />
      <div className="flex absolute inset-0 flex-col">
        {/* Navbar */}
        <Header />
        
  
 

        {/* <nav className="w-full h-14 bg-white m-2"></nav> */}
       
          <div className="flex justify-center items-center h-full mx-auto min-w-[70%]">
            <Issue />

          </div>
       
  
      </div>

    
      {/* Footer */}
      <Footer />
      
    </div>
  )
}
