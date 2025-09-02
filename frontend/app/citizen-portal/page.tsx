"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";

import { useRouter } from "next/navigation";
import SplitText from "@/components/blocks/TextAnimations/SplitText/SplitText";
import ShinyText from "@/components/blocks/TextAnimations/ShinyText/ShinyText";

export default function CitizenPortal() {
  const router = useRouter();
  
  return (
    
    <section style={{position: 'relative', overflow: 'hidden'}}>
    <div className="relative flex flex-col mt-16">
      <div className="flex flex-col justify-center mx-5 p-0 mb-11 items-center">
        <SplitText
          text="Contribute to a better society!"
          className="text-6xl font-semibold text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          // onLetterAnimationComplete={handleAnimationComplete}
        />
        <Label className="m-5 text-lg font-normal text-gray-300">A platform for reporting civic issues and get them resolved by the respective authorities.</Label>
        <div className="flex flex-row gap-5">
          <Button variant={"outline"} onClick={() => {router.push("/profile")}}>My Reports</Button>
          <Button onClick={() => {router.push("/report-issue")}}>Report an issue</Button>
        </div>
       
      </div>

        <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",

          }}>
            <div className="flex justify-center">
              <ShinyText 
                text="Recent Issues" 
                disabled={false} 
                speed={3} 
                className='text-3xl font-normal mb-5' 
              />

            </div>
            <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
              <Input
              id="title"
              className="mb-2"
              placeholder="Search Issues..."
              // value={title}
              // onChange={e => setTitle(e.target.value)}
              // required
            />
            <Button variant={"outline"}><Search></Search></Button>
            </div>
      
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />
            <Issue />

            
            
          </Card>
      
      

    </div>

     
    </section>
    
  )
}
