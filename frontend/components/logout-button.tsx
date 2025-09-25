"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function LogoutButton({ 
  variant = "outline", 
  size = "default", 
  className = "", 
  children = "Logout",
  showIcon = true 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      await logout();
      toast("Logged out successfully", {
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast("Logout Error", {
        description: "There was an issue logging out, but you'll be redirected anyway.",
        variant: "destructive",
      });
      // Still redirect even if there's an error
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? "Logging out..." : children}
    </Button>
  );
}