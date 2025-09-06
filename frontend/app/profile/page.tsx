"use client"

import ProfileHeader from "./profile-header";
import ProfileContent from "./profile-content";
import { useEffect, useState } from "react";
import { toast } from "sonner";



export default function Page() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    joinedDate: "",
    dp: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${baseUrl}/api/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
        if (res.ok) {
          const resJson = await res.json();
          const dataArray = resJson.data;

          // Make sure the array has at least one object
          if (Array.isArray(dataArray) && dataArray.length > 0) {
            const data = dataArray[0]; 
            console.log("Data", data);
            setProfile({
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              phone: data.phone || "",
              bio: data.bio || "",
              location: data.location || "",
              joinedDate: data.created_at || "",
              dp: data.dp || "",
            });


    
          } else {
            toast("No profile data found.");
          }
        }
      } catch (e) {
        // handle error if needed
        toast("Error fetching profile data.", {
          description: "Please try again later."
        });
      }
      finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setProfile((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-10 mt-[5%] mb-[2rem]">
      <ProfileHeader profile={profile} />
      <ProfileContent profile={profile} loading={loading} handleChange={handleChange}/>
    </div>
  );
}
