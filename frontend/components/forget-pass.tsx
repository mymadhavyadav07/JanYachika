"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

import { toast } from "sonner";
import { apiBaseUrl } from "@/data/data";
import { Eye, EyeOff } from "lucide-react";



export function ForgetPassForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  
  // Timer for resend OTP
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  
  const sendOTP = async () => {
    if (!email) {
      toast("Email is required!", {
        description: "Please provide a valid email address.",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast("Invalid email format!", {
        description: "Please provide a valid email address.",
      });
      return;
    }

    setSendingOTP(true);

    try {
      const response = await fetch(`${apiBaseUrl}/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Server error: ${response.status}`);
      }

      toast("✅ OTP sent successfully!", {
        description: "Please check your email for the OTP code.",
      });

      setStep(2);
      setDrawerOpen(true);
      setCountdown(60); // 60 seconds cooldown for resend
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast("❌ Failed to send OTP!", {
        description: error.message || "Please check your internet connection.",
      });
    } finally {
      setSendingOTP(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    await sendOTP();
  };


  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast("Please enter a valid 6-digit OTP", {
        description: "OTP must be exactly 6 digits.",
      });
      return;
    }

    setVerifyingOTP(true);

    try {
      const response = await fetch(`${apiBaseUrl}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Server error: ${response.status}`);
      }

      toast("✅ OTP verified successfully!", {
        description: "Please set your new password.",
      });

      setStep(3);
      setDrawerOpen(false);
      setPasswordDialogOpen(true);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast("❌ OTP verification failed!", {
        description: error.message || "Please check your OTP and try again.",
      });
    } finally {
      setVerifyingOTP(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) {
      toast("Password is required!", {
        description: "Please enter a new password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast("Password too short!", {
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("Passwords don't match!", {
        description: "Please make sure both passwords match.",
      });
      return;
    }

    setResettingPassword(true);

    try {
      const response = await fetch(`${apiBaseUrl}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Server error: ${response.status}`);
      }

      toast("🎉 Password reset successfully!", {
        description: "You can now login with your new password.",
      });

      // Reset form state
      setEmail("");
      setOTP("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
      setPasswordDialogOpen(false);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast("❌ Password reset failed!", {
        description: error.message || "Please try again.",
      });
    } finally {
      setResettingPassword(false);
    }
  };



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

        <Button 
          variant="default" 
          className="w-full" 
          type="button" 
          onClick={sendOTP}
          disabled={sendingOTP}
        >
          {sendingOTP ? "Sending OTP..." : "Send OTP"}
        </Button>
        
        
        
        {/* OTP Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent>
                <DrawerHeader className="flex flex-col gap-2 justify-center items-center">
                    {/* <div className="flex flex-row justify-between w-full items-center"> */}
                    <DrawerTitle>Enter OTP</DrawerTitle>
               
                    <DrawerDescription>
                        An OTP has been sent to <strong>{email}</strong>. Please enter the 6-digit OTP to verify your identity.<br />
                        Haven't received the email? {" "}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-medium" 
                          onClick={resendOTP}
                          disabled={countdown > 0}
                        >
                          {countdown > 0 ? `Resend OTP (${countdown}s)` : "Resend OTP"}
                        </Button>
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
                        <Button variant="secondary" className="w-[50%]" disabled={verifyingOTP}>Close</Button>
                    </DrawerClose>
                    <Button 
                      variant="default" 
                      className="w-[50%]" 
                      type="button" 
                      onClick={verifyOTP}
                      disabled={verifyingOTP || otp.length !== 6}
                    >
                      {verifyingOTP ? "Verifying..." : "Verify OTP"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

        {/* Password Reset Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set New Password</DialogTitle>
              <DialogDescription>
                Please enter your new password. Make sure it's at least 6 characters long.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-600">Passwords don't match</p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPasswordDialogOpen(false)}
                disabled={resettingPassword}
              >
                Cancel
              </Button>
              <Button 
                onClick={resetPassword}
                disabled={resettingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {resettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
