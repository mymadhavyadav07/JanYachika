"use client";


import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText";
import dynamic from "next/dynamic";
import { apiBaseUrl } from "@/data/data";




const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function CitizenPortal() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pictures, setPictures] = useState<FileList | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
   

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch(`${apiBaseUrl}/me`, {
  //         credentials: 'include',
  //       });

  //       if (res.status === 401) {
  //         console.log("Unauthorized. Redirecting to login...");
  //         router.replace("/login");
  //         return;
  //       }

  //       if (!res.ok) {
  //         throw new Error(`Unexpected error: ${res.status}`);
  //       }

  //       const data = await res.json();
  //       console.log(data);
  //       setIsMounted(true);

  //     } catch (err) {
  //       console.log("Failed to fetch data", err);
  //       router.replace("/login");
  //     }
  //   };

  //   fetchData();
  // }, [router]);


  // if (!isMounted){
  //   return null
  // }
  
  const handleSubmit = () => {
    console.log("lol");
    console.log(location);

    };
    
    

  return (
   
    <div className="relative flex flex-col mt-16 mb-20">
    
      <div className="flex flex-row justify-center mx-5 p-0 items-center">
        {/* <Label className="m-5 text-lg font-semibold">Total Issues (count) </Label>
        <Button className="m-5" onClick={() => {router.push("/report-issue")}}>Report an issue</Button> */}
        <BlurText
            text="Report Issues and We will get them fixed!"
            delay={250}
            animateBy="words"
            direction="top"
            className="text-5xl mb-8"
        />

       
      </div>


      <Card className="flex flex-col mx-5 gap-0 my-5">
        <Label className="mx-5 mb-2 text-lg font-semibold">Report Issues</Label>
        <Label className="mx-5 mb-4 text-sm text-gray-400">Help the system improve by reporting civic issues encountered by you.</Label>
        <Separator />
        <form className="flex flex-col mx-5 gap-2 mt-4" onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col w-full">
            <Label className="mb-1 block text-sm font-medium">Select State</Label>
            <Select>
              <SelectTrigger className="w-[80%]">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="h-[18rem]">
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                  <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                  <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                  <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                  <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                  <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            <div className="flex flex-col w-full">
            <Label className="mb-1 block text-sm font-medium">Select City</Label>
            <Select>
              <SelectTrigger className="w-[80%]">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="h-[18rem]">
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                  <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                  <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                  <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                  <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                  <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
          </div>



            <Separator /> 
            <Label className="mb-1 block text-sm font-medium">Title</Label>
            <Input
              id="title"
              className="mb-2"
              placeholder="Enter issue title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <Label className="mb-1 block text-sm font-medium">Description</Label>
            <Textarea
                placeholder="Describe more about your issue..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
            />
            
            
            <Label htmlFor="pictures" className="mb-1 block text-sm font-medium mt-2">Upload Pictures (Multiple are allowed)</Label>
            <Input
              id="pictures"
              type="file"
              multiple
              className="mb-2"
              onChange={e => setPictures(e.target.files)}
            />

            {/* <LocationPicker onLocationSelect={handleLocationSelect} /> */}
            <Label className="mt-5 mb-1 block text-sm font-medium">Pick location</Label>
            <LocationPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />

            <div className="flex justify-center mt-5">
                <Button className="w-[50%]" type="submit">Submit</Button>
            </div>
        </form>
      </Card>

    </div>
    
  )
}
