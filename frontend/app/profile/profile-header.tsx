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
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleCameraClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast("❌ Invalid file type!", {
        description: "Please select an image file (JPG, PNG, etc.)"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast("❌ File too large!", {
        description: "Please select an image smaller than 5MB"
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/upload-profile-picture`, {
        method: 'POST',
        credentials: 'include', // Use cookies for authentication
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast("🎉 Profile picture updated!", {
          description: "Your profile picture has been updated successfully."
        });
        
        // Refresh the page to show the new profile picture
        window.location.reload();
        
      } else {
        toast("❌ Upload failed!", {
          description: responseData.detail || "Failed to upload profile picture"
        });
      }
    } catch (error) {
      console.error("Profile picture upload error:", error);
      toast("❌ Upload failed!", {
        description: "Please check your internet connection and try again."
      });
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  }


  async function handleSaveChanges() {
    setSaving(true);
    
    // Get form values
    const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value?.trim();
    const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value?.trim();
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value?.trim();
    const address = (document.getElementById("location") as HTMLInputElement)?.value?.trim();

    // Create payload matching backend ProfileUpdate model
    const payload = {
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      address: address || null,
      dp: null  // Profile picture will be handled separately
    };

    // Basic validation - at least one field should be provided
    if (!firstName && !lastName && !phone && !address) {
      toast("No changes to update!", {
        description: "Please make some changes before saving.",
        action: {
          label: "OK",
          onClick: () => {},
        },
      });
      setSaving(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/update-profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include', // Use cookies for authentication
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast("💥 Profile updated successfully!", {
          description: "Your profile has been updated."
        });
        
        // Refresh the page to show updated data
        window.location.reload();
        
      } else {
        toast("❌ Failed to update your profile!", {
          description: responseData.detail || "Something went wrong while updating your profile."
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast("❌ Can't connect to the server!", {
        description: "Please check your internet connection and try again."
      });
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
              onClick={handleCameraClick}
              disabled={uploadingImage}>
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-900"></div>
              ) : (
                <Camera />
              )}
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
              <Badge variant="secondary">{ profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Badge>
              
            </div>
            {/* <p className="text-muted-foreground">Senior Product Designer</p> */}
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {profile?.email || "Email Unavailable"}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                {profile?.location || "Location not set"}
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
