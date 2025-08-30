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
import { ArrowDown, ArrowUp } from "lucide-react"
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

export function Issue() {
    const desc = (
        <>
      Enter your email below to login to your account<br />
      Enter your email below to login to your account<br />
      Enter your email below to login to your account
    </>
    );
  return (
    <Card className="max-w-sm w-full min-w-full gap-2 py-0">
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
                <InProgressBadge />
            </div>
            <CardDescription>
            {desc}
            </CardDescription>

            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant={"link"} className="p-0 w-max">View Images</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                    <DrawerTitle>Issue Title</DrawerTitle>
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
