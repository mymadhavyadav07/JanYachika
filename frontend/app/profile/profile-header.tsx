"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Calendar, Mail, MapPin } from "lucide-react";
import { useState, useRef } from "react";

import { toast } from "sonner";

export default function ProfileHeader({ profile }: { profile: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleCameraClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    // You can handle the selected file here
    const file = event.target.files?.[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
    }
  }


  async function handleSaveChanges() {
    setSaving(true);
    const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value;
    const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value;
  
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value;
    const bio = (document.getElementById("bio") as HTMLTextAreaElement)?.value;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      bio,
    };

    if (!phone) {
      console.log("No phone number provided.");
      toast("Phone number is required!", {
          description: "Please update your contact number.",
          action: {
            label: "Fine",
            onClick: () => console.log("Action clicked!"),
          },
        });
      // alert("Phone number is required.");
      setSaving(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast("💥 Profile updated successfully!", {
          description: "Your profile has been updated."
        })
        
      } else {
        toast("❌ Failed to update your profile!", {
          description: "Your profile has been updated."
        })
      }
    } catch (error) {
      toast("❌ Can't connect to the server!", {
        description: "We are poor enough to keep our server running 24/7 😢"
      })
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.dp || "https://bundui-images.netlify.app/avatars/08.png"} alt="Profile" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
              onClick={handleCameraClick} >
              <Camera />
            </Button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{(profile?.firstName || "Not") + " " + (profile?.lastName || "Available")}</h1>
              <Badge variant="secondary">Pro Member</Badge>
            </div>
            {/* <p className="text-muted-foreground">Senior Product Designer</p> */}
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {profile?.email || "Email Unavailable"}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                {location || "Location not set"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                { profile?.joinedDate && (`Joined ${new Date(profile.joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`) || "Join date not available"}
              </div>
            </div>
          </div>
          <Button variant="default" onClick={handleSaveChanges}>{saving ? "Saving..." : "Update Profile"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
