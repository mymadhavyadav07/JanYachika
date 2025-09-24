"use client"

import Image from "next/image";
import SplitText from "@/components/blocks/TextAnimations/SplitText/SplitText";
import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col mt-[6rem]">
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
    </div>
  );
}
