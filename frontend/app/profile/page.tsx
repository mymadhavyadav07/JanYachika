"use client"

import ProfileHeader from "./profile-header";
import ProfileContent from "./profile-content";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { apiBaseUrl } from "@/data/data";


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
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(true);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch(`${apiBaseUrl}/me`, {
  //         credentials: 'include',
  //       });

  //       if (res.status === 401) {
  //         console.log("Unauthorized. Redirecting to login...");
  //         redirect("/login");
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
  //       redirect("/login");
  //     }
  //   };

  //   fetchData();
  // }, [router]);

  
  useEffect(() => {
    async function fetchProfile() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/api/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
        if (res.status === 401) {
          toast("Session expired. Please login again.");
          router.push("/login");
          return;
        }
        
        if (res.ok) {
          const resJson = await res.json();
          const dataArray = resJson.data;

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
              role: data.role || "User"
            });

            console.log(profile);
          } else {
            toast("No profile data found.");
          }
        } else {
          const errorData = await res.json();
          toast("Failed to load profile data", {
            description: errorData.detail || "Please try again later."
          });
        }
      } catch (e) {
        toast("Error fetching profile data.", {
          description: "Please try again later."
        });
      }
      finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [isMounted]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setProfile((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  return ( isMounted && (
    <div className="container mx-auto space-y-6 px-4 py-10 mt-[5%] mb-[2rem]">
      <ProfileHeader profile={profile} />
      <ProfileContent profile={profile} loading={loading} handleChange={handleChange}/>
    </div>
  ));
}
