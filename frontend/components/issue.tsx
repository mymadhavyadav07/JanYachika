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
import { ArrowDown, ArrowUp, MapPin, User } from "lucide-react"
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

}

export function Issue({className, officer_id, 
  issue_title, issue_description, issue_status,
   upvotes, downvotes, photos, latitude, longitude, id}: IssueProps
  ) {
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    // const desc = (
    //     <>
    //   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

    // </>
    // );

    // const desc = (
    //   <>
    //   Issue Description 
    //   </>
    // );
  return (
    <Card className={`max-w-sm w-[85%] min-w-[85%] gap-2 py-0 ${className ?? ""}`}>
      <CardHeader className="space-x-3 flex flex-row items-center pt-4">
        <div className="self-start">
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
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

            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant={"link"} className="p-0 w-max">View Details</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader className="flex flex-col gap-2 items-start">
                      <div className="flex flex-row justify-between w-full items-center">
                        <DrawerTitle>Issue Title</DrawerTitle>
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
        
        <div>
          <Button variant={"ghost"}>{upvotes}<ArrowUp /></Button>
            <Button variant={"ghost"}>{downvotes}<ArrowDown /></Button>
        </div>
      </CardFooter>
    </Card>
  )
}
