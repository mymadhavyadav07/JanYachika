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
import { redirect } from "next/navigation";
import { toast } from "sonner";



const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

type StateOption = {
  id: number;
  state_name: string;
};

export default function CitizenPortal() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pictures, setPictures] = useState<FileList | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  
  const [states, setStates] = useState<StateOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/me`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          console.log("Unauthorized. Redirecting to login...");
          redirect("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Unexpected error: ${res.status}`);
        }

        const data = await res.json();
        const fetchStates = async () => {
          try {
            const res = await fetch(`${apiBaseUrl}/fetch_states_and_dept`); 
            const data = await res.json();
    
            setStates(data.states.data);
    
          } catch (error) {
            console.error('Failed to fetch states:', error);
          }

        };

        fetchStates();
        setIsMounted(true);

      } catch (err) {
        console.log("Failed to fetch data", err);
        redirect("/login");
      }
    };

    fetchData();
  }, [router]);



  if (!isMounted){
    return null
  }
  
  const handleSubmit = async () => {
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      
      // Add text fields
      formData.append('state', selectedState || "0");
      formData.append('city', selectedCity);
      formData.append('title', title);
      formData.append('description', description);
      
      // Add location data if available
      if (location) {
        formData.append('latitude', location.lat.toString());
        formData.append('longitude', location.lng.toString());
      }
      
      // Add files if any
      if (pictures && pictures.length > 0) {
        for (let i = 0; i < pictures.length; i++) {
          formData.append('files', pictures[i]);
        }
      }

      const res = await fetch(`${apiBaseUrl}/report-issue`, {
        method: 'POST',
        credentials: 'include',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });

      if (res.ok) {
        toast("Issue Reported Successfully", {
          description: "Your issue has been submitted and will be reviewed soon.",
          action: {
            label: "Close",
            onClick: () => {},
          },
        });
        // Reset form
        setTitle("");
        setDescription("");
        setPictures(null);
        setLocation(null);
        setSelectedState("");
        setSelectedCity("");
        router.push("/citizen-portal");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast("Failed to Report Issue", {
          description: errorData.message || "Please try again later.",
          action: {
            label: "Close",
            onClick: () => {},
          },
        });
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast("Error", {
        description: "An error occurred while submitting your issue. Please try again.",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    }
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
            <Select name="state" value={selectedState}
             onValueChange={(value) => (setSelectedState(value))} required >
              <SelectTrigger className="w-[80%]">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="h-[18rem]">
                <SelectGroup>
                  <SelectLabel>States</SelectLabel>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id.toString()}>
                      {state.state_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            <div className="flex flex-col w-full">
            <Label className="mb-1 block text-sm font-medium">Select City</Label>
            <Select name="city" value={selectedCity}
            onValueChange={(value) => (setSelectedCity(value))} required >
              <SelectTrigger className="w-[80%]">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent className="h-[18rem]">
                <SelectGroup>
                  <SelectLabel>Cities</SelectLabel>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
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
                <Button className="w-[50%]" type="button" onClick={handleSubmit}>Submit</Button>
            </div>
        </form>
      </Card>

    </div>
    
  )
}
