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
import InProgressBadge from "@/components/ui/pending_badge"
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


interface IssueProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    officer?: boolean;
}

export function Issue({className, officer}: IssueProps) {
    const desc = (
        <>
      Enter your email below to login to your account<br />
      Enter your email below to login to your account<br />
      Enter your email below to login to your account
    </>
    );
  return (
    <Card className={`max-w-sm w-[85%] min-w-[85%] gap-2 py-0 ${className ?? ""}`}>
      <CardHeader className="space-x-3 flex flex-row items-center pt-4">
        <div className="relative top-[-97px] sm:top-[-53px]">
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </div>
        <div className="flex flex-col space-y-2 w-full">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <CardTitle>Issue Title</CardTitle>
                <div className="flex items-center">
                {officer && <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="mr-2"><User />Officer Assigned</Badge>
                </Link> }
                <InProgressBadge />
                </div>
            </div>
            <CardDescription>
            {desc}
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
                          <InProgressBadge />
                          <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="mr-2"><MapPin className="mr-2" />Open in Maps</Badge>
                          </Link>
                          
                        </div>
                      </div>
                    <DrawerDescription>
                        {desc}
                    </DrawerDescription>
                    </DrawerHeader>
                    <Separator />
                    <div className="flex overflow-x-auto gap-4 p-4">
                        <img src="https://placehold.co/200x200" alt="Random Image" className="w-48 h-48 rounded-lg flex-shrink-0" />
                        <img src="https://placehold.co/200x200" alt="Random Image" className="w-48 h-48 rounded-lg flex-shrink-0" />
                        <img src="https://placehold.co/200x200" alt="Random Image" className="w-48 h-48 rounded-lg flex-shrink-0" />
                        <img src="https://placehold.co/200x200" alt="Random Image" className="w-48 h-48 rounded-lg flex-shrink-0" />
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
            <Button variant={"ghost"}>10k<ArrowDown /></Button>
            <Button variant={"ghost"}>20k<ArrowUp /></Button>
        </div>
      </CardFooter>
    </Card>
  )
}
