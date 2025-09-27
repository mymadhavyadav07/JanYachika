
"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { apiBaseUrl, navItems } from "@/data/data";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard } from "lucide-react";
import { useRouter, redirect } from "next/navigation";

interface HeaderProps {
    // Add any props if needed in the future
    className?: string;
}



export default function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(true); // Set to true immediately
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Track auth loading separately
  const [ role, setRole ] = useState("");
  const [ authenticated, setAuthenticated ] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set a timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000); // 5 second timeout

        const res = await fetch(`${apiBaseUrl}/me`, {
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.status === 401) {
          console.log("Unauthorized. User not logged in.");
          setAuthenticated(false);
          setIsAuthLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Unexpected error: ${res.status}`);
        }

        const data = await res.json();
        setRole(data.message.role.toString());
        setAuthenticated(true);
        console.log("ROLE:", data.message.role.toString());
        setIsAuthLoading(false);

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("Auth check timed out, showing login buttons");
        } else {
          console.log("Failed to fetch auth data:", err);
        }
        setAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }
    };

    fetchData();
  }, [router]);

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!role) return "/citizen"; // Default fallback
    
    switch (role.toLowerCase()) {
      case "admin":
        return "/admin";
      case "officer":
        return "/officer";
      case "citizen":
      default:
        return "/citizen";
    }
  };

  const getDashboardLabel = () => {
    if (!role) return "Dashboard";
    
    switch (role.toLowerCase()) {
      case "admin":
        return "Admin Dashboard";
      case "officer":
        return "Officer Dashboard";
      case "citizen":
      default:
        return "Citizen Dashboard";
    }
  };


  return (
        <div className={`relative w-full ${className ?? ""}`}>
            <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                {authenticated ? (
                  // Authenticated - show dashboard button
                  <div className="flex items-center gap-4">
                    <NavbarButton 
                      variant="primary" 
                      href={getDashboardRoute()}
                      className="flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {getDashboardLabel()}
                    </NavbarButton>
                  </div>
                ) : (
                  // Non-authenticated buttons (show immediately, even while loading)
                  <div className="flex items-center gap-4">
                    <NavbarButton 
                      variant="secondary" 
                      href="/login"
                      className={isAuthLoading ? "opacity-75" : ""}
                    >
                      Login
                    </NavbarButton>
                    <NavbarButton 
                      variant="primary" 
                      href="/register"
                      className={isAuthLoading ? "opacity-75" : ""}
                    >
                      Sign Up
                    </NavbarButton>
                  </div>
                )}
            </NavBody>
    
            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                <NavbarLogo />
                <MobileNavToggle
                    isOpen={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
                </MobileNavHeader>
    
                <MobileNavMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                >
                {navItems.map((item, idx) => (
                    <a
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    className="relative text-neutral-600 dark:text-neutral-300"
                    >
                    <span className="block">{item.name}</span>
                    </a>
                ))}
                <div className="flex w-full flex-col gap-4">
                  {authenticated ? (
                    // Authenticated mobile menu
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Role: {role || 'User'}
                      </div>
                      <NavbarButton
                        href={getDashboardRoute()}
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {getDashboardLabel()}
                      </NavbarButton>
                    </>
                  ) : (
                    // Non-authenticated mobile menu (show immediately)
                    <>
                      <NavbarButton
                        href="/login"
                        variant="primary"
                        className={`w-full ${isAuthLoading ? "opacity-75" : ""}`}
                      >
                        Login
                      </NavbarButton>
                      <NavbarButton
                        href="/register"
                        variant="primary"
                        className={`w-full ${isAuthLoading ? "opacity-75" : ""}`}
                      >
                        Sign Up
                      </NavbarButton>
                    </>
                  )}
                </div>
                </MobileNavMenu>
            </MobileNav>
            </Navbar>
        </div>
    );
}
