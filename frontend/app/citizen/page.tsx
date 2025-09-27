"use client"


import { Issue } from "@/components/issue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Search, ListFilter, X } from "lucide-react";

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
  city?: string;
  state_name?: string;

};


export default function CitizenPortal() {
  const router = useRouter();
  const [placeholder, setPlaceholder] = useState<string>("Search issues by title...");
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState<string>("issue_title");
  const [query, setQuery] = useState<string>("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);


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
        setAllIssues(data.issues); // Store original issues for clearing search
        setIsMounted(true);

      } catch (err) {
        console.log("Failed to fetch data", err);
        redirect("/login");
      }
    };


    fetchData();
    fetchIssues();
  }, [router]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);


  if (!isMounted) return null;

  
  
  const handleSearch = async () => {
    if (!query.trim()) {
      // If query is empty, show all issues
      setIssues(allIssues);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      // Use query parameters instead of body for GET request
      const searchParams = new URLSearchParams({
        query: query.trim(),
        filter: filter
      });
      
      const response = await fetch(`${apiBaseUrl}/search-issues?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setIssues(result.issues || []);
      setHasSearched(true);
      console.log('Search results:', result.issues);

    } catch(error) {
      console.error('Search error:', error);
      // Show user-friendly error message
      setIssues([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setIssues(allIssues);
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              <div className="relative flex-1">
                <Input
                  id="title"
                  className="mb-2 pr-10"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => {
                    const newQuery = e.target.value;
                    setQuery(newQuery);
                    
                    // Clear existing timer
                    if (debounceTimer) {
                      clearTimeout(debounceTimer);
                    }
                    
                    // Set new timer for auto-search after 500ms of no typing
                    const timer = setTimeout(() => {
                      if (newQuery.trim() || hasSearched) {
                        handleSearch();
                      }
                    }, 500);
                    
                    setDebounceTimer(timer);
                  }}
                  onKeyPress={handleKeyPress}
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-200"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button 
                variant={"outline"} 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  <ListFilter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    {filter === 'issue_title' ? 'Title' : 
                     filter === 'state' ? 'State' : 
                     filter === 'city' ? 'City' : 
                     filter === 'issue_status' ? 'Status' : 'Filter'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 sm:mr-9 mr-2" align="start">
                <DropdownMenuItem
                  onSelect={() => {setFilter("issue_title"); setPlaceholder("Search issues by title...")}}
                  className={`cursor-pointer ${filter === 'issue_title' ? 'bg-accent' : ''}`}
                >
                  Issue Title
                  {filter === 'issue_title' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {setFilter("state"); setPlaceholder("Search issues by state...")}}
                  className={`cursor-pointer ${filter === 'state' ? 'bg-accent' : ''}`}
                >
                  State
                  {filter === 'state' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {setFilter("city"); setPlaceholder("Search issues by city...")}}
                  className={`cursor-pointer ${filter === 'city' ? 'bg-accent' : ''}`}
                >
                  City
                  {filter === 'city' && <span className="ml-auto text-xs">✓</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {setFilter("issue_status"); setPlaceholder("Search by status (pending, in-progress, resolved)...")}}
                  className={`cursor-pointer ${filter === 'issue_status' ? 'bg-accent' : ''}`}
                >
                  Status
                  {filter === 'issue_status' && <span className="ml-auto text-xs">✓</span>}
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
              
            {/* Search results info */}
            {hasSearched && (
              <div className="w-[85%] text-center py-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {issues.length > 0 
                    ? `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} for "${query}"`
                    : `No issues found for "${query}". Try a different search term or filter.`
                  }
                </p>
                {issues.length === 0 && (
                  <Button 
                    variant="link" 
                    onClick={handleClearSearch}
                    className="mt-2"
                  >
                    View all issues
                  </Button>
                )}
              </div>
            )}

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
              city={issue.city}
              state_name={issue.state_name}

              key={issue.id} />
                
            ))}
      
            
            
            
          </Card>
      
      

    </div>

     
    </section>
    
  )
}
