"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import PendingBadge from "@/components/ui/pending_badge"
import { ArrowDown, ArrowUp, MapPin, User, MapPinIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import InProgressBadge from "./ui/in_progress_badge"
import ResolvedBadge from "./ui/resolved_badge"
import { useState, useEffect } from "react"
import { apiBaseUrl } from "@/data/data"
import { toast } from "sonner"


interface IssueProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id'> {
    className?: string;
    officer_id?: number;
    issue_title?: string;
    issue_description?: string;
    issue_status?: string;
    upvotes?: number;
    downvotes?: number;
    photos?: string[];
    latitude?: string;
    longitude?: string;
    id?: number;
    dp?: string;
    city?: string;
    state_name?: string;

}

export function Issue({className, officer_id, 
  issue_title, issue_description, issue_status,
   upvotes, downvotes, photos, latitude, longitude, id, dp, city, state_name}: IssueProps
  ) {
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    // State for vote counts and user's vote status
    const [currentUpvotes, setCurrentUpvotes] = useState(upvotes || 0);
    const [currentDownvotes, setCurrentDownvotes] = useState(downvotes || 0);
    const [userVoteType, setUserVoteType] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [hasLoadedVoteStatus, setHasLoadedVoteStatus] = useState(false);
    
    // Load user's vote status on component mount
    useEffect(() => {
      if (id && !hasLoadedVoteStatus) {
        loadUserVoteStatus();
      }
    }, [id, hasLoadedVoteStatus]);
    
    const loadUserVoteStatus = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/issue-vote-status/${id}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserVoteType(data.vote_type);
          setHasLoadedVoteStatus(true);
        } else {
          // User might not be authenticated, that's okay
          setHasLoadedVoteStatus(true);
        }
      } catch (error) {
        console.error('Error loading vote status:', error);
        setHasLoadedVoteStatus(true);
      }
    };
    
    const handleVote = async (voteType: 'upvote' | 'downvote') => {
      
      if (!id || isVoting) return;
      
      setIsVoting(true);
      
      try {
        const response = await fetch(`${apiBaseUrl}/vote-issue/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ vote_type: voteType }),
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            toast("Authentication Required", {
              description: "Please log in to vote on issues.",
              action: {
                label: "Login",
                onClick: () => window.location.href = '/login',
              },
            });
            return;
          }
          throw new Error('Failed to vote');
        }
        
        const data = await response.json();
        
        // Update the UI with the new vote counts
        setCurrentUpvotes(data.upvotes);
        setCurrentDownvotes(data.downvotes);
        setUserVoteType(data.vote_type);
        
 
      } catch (error) {
        console.error('Error voting:', error);
        
      } finally {
        setIsVoting(false);
      }
    };
  return (
    <Card className={`max-w-sm w-[85%] min-w-[85%] gap-2 py-0 ${className ?? ""}`}>
      <CardHeader className="space-x-3 flex flex-row items-center pt-4">
        <div className="self-start">
            <Avatar>
                <AvatarImage src={dp} />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
        <div className="flex flex-col space-y-2 w-full">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <CardTitle>{issue_title || ""}</CardTitle>
                <div className="flex items-center">
                {officer_id && <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="mr-2"><User />Officer Assigned</Badge>
                </Link> }
                {issue_status === "pending" && <PendingBadge />}
                {issue_status === "in-progress" && <InProgressBadge />}
                {issue_status === "resolved" && <ResolvedBadge />}
                </div>
            </div>
            <CardDescription>
            {issue_description || ""}
            </CardDescription>
            
            {/* Location information */}
            {(city || state_name) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPinIcon className="h-3 w-3" />
                <span>
                  {city && state_name ? `${city}, ${state_name}` : city || state_name}
                </span>
              </div>
            )}

            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant={"link"} className="p-0 w-max">View Details</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="flex flex-col gap-2 items-start">
                      <div className="flex flex-row justify-between w-full items-center">
                        <DrawerTitle>{issue_title}</DrawerTitle>
                        <div className="flex flex-row items-center gap-2">
                          {issue_status === "pending" && <PendingBadge />}
                          {issue_status === "in-progress" && <InProgressBadge />}
                          {issue_status === "resolved" && <ResolvedBadge />}
                          <Link href={mapsUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="mr-2"><MapPin className="mr-2" />Open in Maps</Badge>
                          </Link>
                          
                        </div>
                      </div>
                    <DrawerDescription>
                        {issue_description || ""}
                    </DrawerDescription>
                    
                    {/* Location information in drawer */}
                    {(city || state_name) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="font-medium">
                          Location: {city && state_name ? `${city}, ${state_name}` : city || state_name}
                        </span>
                      </div>
                    )}
                    </DrawerHeader>
                    <Separator />
                    <div className="flex overflow-x-auto gap-4 p-4">
                      {photos?.map((photo, index) => (
                        <img key={index} src={photo} alt="Random Image" className="w-48 h-48 rounded-lg flex-shrink-0" />
                      ))}
                        
                    </div>
                    <Separator />
                    <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
      </CardHeader>

      <Separator />
      <CardFooter className="flex-row gap-2 justify-end pb-2">
        <div className="flex items-center gap-1">
          <Button 
            variant={userVoteType === 'upvote' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleVote('upvote')}
            disabled={isVoting}
            className={`flex items-center gap-1 ${userVoteType === 'upvote' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
          >
            {currentUpvotes}
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant={userVoteType === 'downvote' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleVote('downvote')}
            disabled={isVoting}
            className={`flex items-center gap-1 ${userVoteType === 'downvote' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}`}
          >
            {currentDownvotes}
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
