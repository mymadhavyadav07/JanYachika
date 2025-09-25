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
import { toast } from "sonner";
import { apiBaseUrl } from "@/data/data";
import { redirect } from "next/navigation";

type StateOption = {
  id: number;
  state_name: string;
};

type Depts = {
  id: number;
  dep_name: string;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedState, setSelectedState] = useState<string>();
  const [selectedDept, setSelectedDept] = useState<string>();
  const [fname, setFname] = useState<string>("");
  const [lname, setLname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const [states, setStates] = useState<StateOption[]>([]);
  const [depts, setDepts] = useState<Depts[]>([]);  

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/fetch_states_and_dept`); 
        const data = await res.json();

        setStates(data.states.data);
        setDepts(data.depts.data);

      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };

    fetchStates();
  }, []);

  const registerUser = async() => {

    try {
        const response = await fetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fname: fname,
            lname: lname,
            email: email,
            state: parseInt(selectedState || "0"),
            dept: parseInt(selectedDept || "0"),
            role: role,
            passwrd: pass
        }),
        });
        
        if (response.status === 409) {
          toast("⚠️ User already exists!", {
            description: "An account with this email already exists.",
            action: {
              label: "Close",
              onClick: () => {},
            },
          });
          return; 
        }

        if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        toast("User created successfully!", {
        description: "You can now login with the same information.",
          action: {
            label: "Close",
            onClick: () => {},
          },
      })
      setTimeout(() => {redirect("/login")}, 1000);

        

  
    } catch (error) {
      console.log("ERROR:", error)
        toast("❌ Failed to send mail!", {
        description: "Please check your internet connection.",
          action: {
            label: "Close",
            onClick: () => { console.log("Can't send mail!"); },
          },
      })
    }
  }



  
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* States */}
        <div className="grid gap-3">
          <Label htmlFor="state">State</Label>
          <Select name="state"
           value={selectedState} 
           onValueChange={(value) => setSelectedState(value)} 
           required >
            <SelectTrigger className="w-full" id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
            {states.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.state_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role */}
        <div className="grid gap-3">
          <Label htmlFor="role">Role</Label>
          <Select name="role"
          value={role} 
          onValueChange={(value) => setRole(value)}
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
          <Select name="department" value={selectedDept} 
          onValueChange={(value) => setSelectedDept(value)}
          required>
            <SelectTrigger className="w-full" id="department">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {depts.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.dep_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        )}


        {/* First Name */}
        <div className="grid gap-3">
          <Label htmlFor="fname">First Name</Label>
          <Input id="fname" type="fname" placeholder="First Name"
          value={fname} 
          onChange={(e) => setFname(e.target.value)} required />  
        </div>

        {/* Last Name */}
        <div className="grid gap-3">
          <Label htmlFor="lname">Last Name</Label>
          <Input id="lname" type="lname" placeholder="Last Name"
          value={lname} 
          onChange={(e) => setLname(e.target.value)} required />
        </div>


        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} required />
        </div>

        {/* Password */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            
          </div>
          <div className="relative">
            <Input
              className="pr-10"
              id="password"
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
              }}
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
        <Button type="button" onClick={registerUser}  className="w-full">
          Sign up
        </Button>

        
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>

    // </Card>
  );
}
