"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import BlurText from "@/components/blocks/TextAnimations/BlurText/BlurText";

import LocationPicker from "@/components/LocationPicker";
import { withAuth } from '@/lib/auth';




// Auth logic
// export const getServerSideProps = withAuth;

// export default function Profile({ user }: { user: any }) {
//   return <div>Profile: {user.user}</div>;
// }



export default function CitizenPortal() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
//   const [location, setLocation] = useState("");
  const [pictures, setPictures] = useState<FileList | null>(null);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

//   const handleLocationSelect = (lat: number, lng: number) => {
//     setLocation({ lat, lng });
//     console.log(location);
//   };

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
            
            
            <Label htmlFor="pictures" className="mb-1 block text-sm font-medium">Upload Pictures (Multiple are allowed)</Label>
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
