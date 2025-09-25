"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Search, ListFilter } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { apiBaseUrl } from "@/data/data";
import { redirect, useRouter } from "next/navigation";
import SplitText from "@/components/blocks/TextAnimations/SplitText/SplitText";
import ShinyText from "@/components/blocks/TextAnimations/ShinyText/ShinyText";


type Issue = {
  id: number;
  dp: string;
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/me`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          console.log("Unauthorized. Redirecting to login...");
          redirect("/login");
         
        }

        if (!res.ok) {
          throw new Error(`Unexpected error: ${res.status}`);
        }

        
        const data = await res.json();
        setIsMounted(true);

      } catch (err) {
        console.log("Failed to fetch data", err);
        redirect("/login");
      }
    };

    const fetchIssues = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/search-issues`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          console.log("Unauthorized. Redirecting to login...");
          redirect("/login");
        }

        if (!res.ok) {
          throw new Error(`Unexpected error: ${res.status}`);
        }

        const data = await res.json();
        setIssues(data.issues);
        setIsMounted(true);

      } catch (err) {
        console.log("Failed to fetch data", err);
        redirect("/login");
      }
    };


    fetchData();
    fetchIssues();
  }, [router]);


  if (!isMounted) return null;

  
  
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

  

  return (
    
    <section style={{position: 'relative', overflow: 'hidden'}}>
    <div className="relative flex flex-col mt-16">
      <div className="flex flex-col justify-center mx-5 p-0 mb-11 items-center">
        <SplitText
          text="Contribute to a better society!"
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
        />
        <Label className="m-5 text-lg font-normal dark:text-gray-300 text-gray-600">A platform for reporting civic issues and get them resolved by the respective authorities.</Label>
        <div className="flex flex-row gap-5">
          <Button variant={"outline"} onClick={() => {redirect("#")}}>My Reports</Button>
          <Button onClick={() => {redirect("/report-issue")}}>Report an issue</Button>
        </div>
       
      </div>

        <Card className="flex flex-col mx-5 gap-5 my-5 justify-center items-center mb-20" 
          style={{background: "transparent",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",

          }}>
            <div className="flex justify-center">
              <ShinyText 
                text="Reported Issues" 
                disabled={false} 
                speed={3} 
                className='text-3xl font-normal mb-5' 
              />

            </div>
            <div className="w-[85%] flex justify-center mt-5 mx-5 gap-2">
              <Input
              id="title"
              className="mb-2"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}

            />
            <Button variant={"outline"} onClick={handleSearch}><Search></Search></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}><ListFilter></ListFilter></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 sm:mr-9 mr-2" align="start">
                <DropdownMenuItem
                  onSelect={() => {setFilter("issue_title"); setPlaceholder("Search issues by title...")}}
                  className={`cursor-pointer`}
                >
                  Issue Title
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {setFilter("state"); setPlaceholder("Search issues by state...")}}
                  className={`cursor-pointer`}
                >
                  State
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {setFilter("city"); setPlaceholder("Search issues by city...")}}
                  className={`cursor-pointer`}
                >
                  City
                </DropdownMenuItem>

                {/* <DropdownMenuItem
                  onSelect={() => {setFilter("upvotes"); setPlaceholder("Search issues by upvotes...")}}
                  className={`cursor-pointer`}
                >
                  Upvotes
                </DropdownMenuItem> */}
   
                
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
              

            {issues.map((issue) => (
              <Issue 
              officer_id={issue.officer_id}
              issue_title={issue.issue_title}
              issue_description={issue.issue_description}
              issue_status={issue.issue_status}
              latitude={issue.latitude}
              longitude={issue.longitude}
              photos={issue.photos}
              upvotes={issue.upvotes}
              downvotes={issue.downvotes}
              id={issue.id}
              dp={issue.dp}

              key={issue.id} />
                
            ))}
      
            
            
            
          </Card>
      
      

    </div>

     
    </section>
    
  )
}
