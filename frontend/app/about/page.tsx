"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import ChromaGrid from "@/components/ChromaGrid";

import { apiBaseUrl } from "@/data/data";
import { redirect, useRouter } from "next/navigation";
import SplitText from "@/components/blocks/TextAnimations/SplitText/SplitText";
import ShinyText from "@/components/blocks/TextAnimations/ShinyText/ShinyText";
import niti from "@/public/Niti.jpeg"

type Issue = {
  id: number;
  officer_id: number;
  issue_title: string;
  issue_description: string;
  photos: string[];
  latitude: string,
  longitude: string,
  issue_status: string,
  downvotes: number;
  upvotes: number;

};


export default function CitizenPortal() {
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState<string>("Search issues by title...");
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState<string>("issue_title");
  const [query, setQuery] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);


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
  //       if (data.role != "admin")
  //         redirect("/403");

  //       console.log(data);
  //       setIsMounted(true);

  //     } catch (err) {
  //       console.log("Failed to fetch data", err);
  //       redirect("/login");
  //     }
  //   };

  //   const fetchIssues = async () => {
  //     try {
  //       const res = await fetch(`${apiBaseUrl}/search-issues`, {
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
  //       setIssues(data.issues);
  //       setIsMounted(true);

  //     } catch (err) {
  //       console.log("Failed to fetch data", err);
  //       redirect("/login");
  //     }
  //   };


  //   fetchData();
  //   fetchIssues();
  // }, [router]);


  // if (!isMounted){
  //   return null
  // }

  
  
  const handleSearch = async () => {
    try{
      const response = await fetch(`${apiBaseUrl}/search-issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 

        body: JSON.stringify({ query: query,
            filter: filter,
           }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.issues)

    
    } catch(error){
        console.log(error);
      }
  };

  const items = [
    {
      image: "https://avatars.githubusercontent.com/u/66372332?v=4",
      title: "Madhav Yadav",
      subtitle: "Backend Engineer",
      handle: "@mymadhavyadav07",
      borderColor: "#3B82F6",
      gradient: "linear-gradient(145deg, #3B82F6, #000)",
      url: "https://linkedin.com/in/mymadhavyadav07"
    },
    {
      image: `${niti.src}`,
      title: "Niti Mishra",
      subtitle: "Database Admin",
      handle: "@niti-mishra",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://www.linkedin.com/in/niti-mishra-16b34a326"
    },
    {
      image: "https://i.pravatar.cc/300?img=2",
      title: "Mike Chen",
      subtitle: "Backend Engineer",
      handle: "@mikechen",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://linkedin.com/in/mikechen"
    },
    {
      image: "https://i.pravatar.cc/300?img=2",
      title: "Mike Chen",
      subtitle: "Backend Engineer",
      handle: "@mikechen",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://linkedin.com/in/mikechen"
    },
    {
      image: "https://i.pravatar.cc/300?img=2",
      title: "Mike Chen",
      subtitle: "Backend Engineer",
      handle: "@mikechen",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://linkedin.com/in/mikechen"
    },
    {
      image: "https://i.pravatar.cc/300?img=2",
      title: "Mike Chen",
      subtitle: "Backend Engineer",
      handle: "@mikechen",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://linkedin.com/in/mikechen"
    }
  ];

  return (
    
    <section style={{position: 'relative', overflow: 'hidden'}}>
    <div className="relative flex flex-col mt-16">
        <div className="flex flex-col justify-center mx-5 p-0 mb-11 items-center">
            <SplitText
            text="About Us"
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
            <Label className="m-5 text-lg font-normal dark:text-gray-300 text-gray-600">Say hi to the team behind JanYachika👋</Label>
        </div>

        <div style={{ height: '50%', position: 'relative', marginBottom: "5rem" }}>
            <ChromaGrid 
                items={items}
                radius={300}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
            />
        </div>  
      

    </div>

     
    </section>
    
  )
}
