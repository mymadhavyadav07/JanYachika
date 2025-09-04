"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { useEffect } from "react";
import { toast } from "sonner";
import { apiBaseUrl } from "@/data/data";



export function ForgetPassForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isMounted, setIsMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");

  useEffect(() => {
          setIsMounted(true);
          }, []);

  
  const sendMail = async () => {
    
    if (!email) {
      toast("Email is required!", {
        description: "Please provide a valid email.",
          action: {
            label: "Close",
            onClick: () => { return },
          },
      })
      return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/send-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            to: email,
            subject: "Test Email",
            message: "This is a test email sent from React to FastAPI!",
        }),
        });

        if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("Email sent successfully:", result);

        setDrawerOpen(true);
    } catch (error) {
        toast("❌ Failed to send mail!", {
        description: "Please check your internet connection.",
          action: {
            label: "Close",
            onClick: () => { console.log("Can't send mail!"); setDrawerOpen(false); },
          },
      })
    }
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // setDrawerOpen(true);
  };


  const handleSubmit = async () => {
    console.log(`${otp}`);
   
      return;
    }



  return (
    // <Card className="mx-auto w-full max-w-md shadow-lg">
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to reset your password
        </p>
      </div>

      <div className="grid gap-6">
        

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <Button variant={"default"} className="w-full" type="button" onClick={sendMail}>Send Email Link</Button>
        
        
        
        {/* OTP Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent>
                <DrawerHeader className="flex flex-col gap-2 justify-center items-center">
                    {/* <div className="flex flex-row justify-between w-full items-center"> */}
                    <DrawerTitle>Enter OTP</DrawerTitle>
               
                    <DrawerDescription>
                        An OTP has been sent to your email. Please enter the OTP to reset your password.<br />
                        Haven't recieved the email? <Button variant="link" className="p-0">Resend OTP</Button>
                    </DrawerDescription>
                </DrawerHeader>
                <Separator />
                
                <div className="flex flex-col items-center gap-2 text-center my-5">
                <InputOTP maxLength={6} containerClassName="gap-4" value={otp} onChange={(e) => setOTP(e)}>
                    <InputOTPGroup className="gap-[0.5rem]">
                        <InputOTPSlot
                        index={0}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        
                        />
                        <InputOTPSlot
                        index={1}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    <InputOTPGroup className="gap-[0.5rem]">
                        <InputOTPSlot
                        index={2}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        />
                        <InputOTPSlot
                        index={3}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        />
                    </InputOTPGroup>

                    <InputOTPSeparator />

                    <InputOTPGroup className="gap-[0.5rem]">
                        <InputOTPSlot
                        index={4}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        />
                        <InputOTPSlot
                        index={5}
                        className="w-10 h-10 text-lg sm:w-16 sm:h-16 sm:text-2xl border-2 rounded-md text-center"
                        />
                    </InputOTPGroup>
                </InputOTP>

                </div>

                <Separator />
                
                <DrawerFooter className="flex flex-row justify-between gap-2">
                    <DrawerClose asChild>
                        <Button variant="secondary" className="w-[50%]">Close</Button>
                    </DrawerClose>
                    <Button variant="default" className="w-[50%]" type="button" onClick={handleSubmit}>Submit</Button>
                
                </DrawerFooter>
            </DrawerContent>
        </Drawer>


        
      </div>

      <div className="text-center text-sm">
        Dont have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>

    // </Card>
  );
}
