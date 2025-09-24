
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
import { useState } from "react";
import { navItems } from "@/data/data";
import { useEffect } from "react";

interface HeaderProps {
    // Add any props if needed in the future
    className?: string;
}



export default function Header({ className }: HeaderProps) {
    
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
        setIsMounted(true);
    }, []);


  return (
        <div className={`relative w-full mt-1 ${className ?? ""}`}>
            <Navbar>
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                <NavbarButton variant="secondary" href="/login">Login</NavbarButton>
                <NavbarButton variant="primary" href="/register">Sign Up</NavbarButton>
                </div>
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative text-neutral-600 dark:text-neutral-300"
                    >
                    <span className="block">{item.name}</span>
                    </a>
                ))}
                <div className="flex w-full flex-col gap-4">
                    <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    >
                    Login
                    </NavbarButton>
                    <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                    >
                    Book a call
                    </NavbarButton>
                </div>
                </MobileNavMenu>
            </MobileNav>
            </Navbar>
        </div>
    );
}
