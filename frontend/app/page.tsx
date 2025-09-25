"use client"

import SplitText from "@/components/blocks/TextAnimations/SplitText/SplitText";
import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import image from "@/public/preview.png"

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col mt-[1rem]">
        <SplitText
          text="See a Problem? Report It. We'll Handle the Rest."
          className="text-4xl font-semibold text-center"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          textAlign="center"
        />

        <BlurText
          text="An open platform where residents can report problems in real-time, stay informed on resolutions, and actively participate in civic improvement."
          delay={150}
          animateBy="words"
          direction="bottom"
          className="m-5 text-lg text-center w-[100%] font-normal dark:text-gray-300 text-gray-600"
        />

        <div className="flex flex-row gap-[1rem] justify-center">
          <Button onClick={() => {redirect("/login");}}>Get Started</Button>
          <Button variant={"outline"} onClick={() => {redirect("/about");}}>About Us</Button>
        </div>
        
        

      </div>

      <section className="w-full">
      <Card className="flex flex-row h-[27rem] mx-5 gap-5 my-5 justify-between items-center mb-20" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",

          }}>
            <div className="flex flex-col">
                <SplitText
                  text="Download Android App."
                  className="text-4xl ml-5 font-semibold"
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  textAlign="left"
              />
              
              <Label className="m-5 text-lg font-normal dark:text-gray-300 text-gray-600">Report your local issues from your fingertips. Download the App now!</Label>
              <div className="flex flex-col sm:flex-row gap-[1rem] justify-start ml-5">
                <Button onClick={() => {redirect("#");}}>Download Android App</Button>
                <Button variant={"outline"} onClick={() => {redirect("/about");}}>Learn More</Button>
              </div>
            
            </div>
            <div className="mockup-phone border-[#1e1c1a] transform scale-50 sm:scale-40 md:scale-45 lg:scale-50 xl:scale-40">
              <div className="mockup-phone-camera"></div>
              <div className="mockup-phone-display">
                <img 
                  alt="wallpaper" 
                  src={image.src} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          
      </Card>

      </section>
    </div>
  );
}
