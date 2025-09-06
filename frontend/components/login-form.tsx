"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { apiBaseUrl } from "@/data/data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [dept, setDept] = useState<string>("");
  
  

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleSubmit = async () => {
    const res = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Required for cookies
      body: JSON.stringify({ state: state,
          dept: dept,
          role: role,
          email: email,
          password: pass, }),
    });

    if (res.ok) {
      alert('Login successful!');
      router.replace("/citizen-portal");
    } else {
      alert('Login failed');
    }
  };


  const handleRoleChange = (value: string) => {
    setRole(value);
    
  };


  // const handleSubmit = async() => {
  //   try {
  //     const response = await fetch(`${apiBaseUrl}/login`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
        
  //       body: JSON.stringify({
  //         state: state,
  //         dept: dept,
  //         role: role,
  //         email: email,
  //         password: pass,
  //       }),
  //     });

  //     if (response.status === 401) {
  //       toast("❌ Unauthorized!", {
  //         description: "Invalid credentials. Please try again.",
  //         action: {
  //           label: "Close",
  //           onClick: () => {},
  //         },
  //       });
  //       return;
  //     }

  //     if (!response.ok) {
  //       toast("❌ Login failed!", {
  //         description: "Something went wrong.",
  //         action: {
  //           label: "Close",
  //           onClick: () => {},
  //         },
  //       });
  //       return;
  //     }

  //     const result = await response.json();
  //     console.log(result);

  //     setTimeout(() => {
  //       router.replace("/citizen-portal");
  //     }, 1000);
      
  //     toast("Login Successful", {
  //       description: "Please wait while for a while...",
  //       action: {
  //         label: "Close",
  //         onClick: () => {},
  //       },
  //     });
      


  //   } catch (error) {
  //     console.log(error);
  //     toast("❌ Failed to send mail!", {
  //       description: "Please check your internet connection.",
  //       action: {
  //         label: "Close",
  //         onClick: () => {},
  //       },
  //     });
  //   }
  // }
  return (
    // <Card className="mx-auto w-full max-w-md shadow-lg">
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* States */}
        <div className="grid gap-3">
          <Label htmlFor="state">State</Label>
          <Select name="state" value={state} 
           onValueChange={(value) => setState(value)} 
           required >
            <SelectTrigger className="w-full" id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role */}
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <Select name="role"
          value={role} 
          onValueChange={handleRoleChange}
          required >
            <SelectTrigger className="w-full" id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citizen">Citizen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="officer">Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        {(role === "admin" || role === "officer") && (
        <div className="grid gap-3">
          <Label htmlFor="department">Department</Label>
          <Select name="department" value={dept} 
           onValueChange={(value) => setDept(value)} 
           required >
            <SelectTrigger className="w-full" id="department">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        )}

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" value={email} 
          onChange={(e) => setEmail(e.target.value)} required />
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <div className="relative">
            <Input
              className="pr-10"
              id="password"
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <Button
              className="absolute right-1 top-1/2 -translate-y-1/2"
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <EyeOff className="h-4 w-4" /> // visible → show EyeOff
              ) : (
                <Eye className="h-4 w-4" /> // hidden → show Eye
              )}
            </Button>
          </div>
        </div>

        {/* Submit */}
        <Button type="button" onClick={handleSubmit} className="w-full">
          Login
        </Button>

        {/* Divider */}
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        {/* Google */}
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Login with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>

  
  );
}
