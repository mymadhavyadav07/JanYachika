

import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode_toggle";
import { Dock, DockIcon } from "@/components/magicui/dock";
import { CalendarIcon, HomeIcon, MailIcon, PencilIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";


export type IconProps = React.HTMLAttributes<SVGElement>;


interface FooterProps extends React.HTMLAttributes<HTMLElement> {
    className?: string;
}


// const [user, setUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   getCurrentUser().then((user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });
  // }, []);


export default function Footer({className}: FooterProps) {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const Icons = {
        calendar: (props: IconProps) => <CalendarIcon {...props} />,
        email: (props: IconProps) => <MailIcon {...props} />,
        logout: (props: IconProps) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out-icon lucide-log-out"><path d="m16 17 5-5-5-5"/>
              <path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            </svg>
        ),
        heatmap: (props: IconProps) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-icon lucide-map">
              <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>
            </svg>
        ),
        issue: (props: IconProps) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-alert-icon lucide-badge-alert"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        ),
        profile: (props: IconProps) => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-user-round-icon lucide-circle-user-round">
              <path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/>
            </svg>
        ),
    };

    const DATA = {
        navbar: [
            { href: "/", icon: HomeIcon, label: "Home" },
    
        ],
        contact: {
            social: {
            profile: {
                name: "Edit Profile",
                url: "/profile",
                icon: Icons.profile,
            },
            issue: {
                name: "Raise Issue",
                url: "/report-issue",
                icon: Icons.issue,
            },
            heatmap: {
                name: "View Heatmap",
                url: "/map-view",
                icon: Icons.heatmap,
            },
            logout: {
                name: "Logout",
                url: "#",
                icon: Icons.logout,
                onClick: handleLogout,
            },
            },
        },
        };

    return (
        <footer className={`fixed mb-2 bottom-0 w-full flex justify-center mt-5 ${className ?? ""}`}>
      <TooltipProvider>
        <Dock direction="middle">
            {DATA.navbar.map((item) => (
              <DockIcon key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full",
                      )}
                    >
                      <item.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full" />
            {Object.entries(DATA.contact.social).map(([name, social]) => (
              <DockIcon key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      aria-label={social.name}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "size-12 rounded-full ",
                      )}
                    >
                      <social.icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{social.name}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))}
            <Separator orientation="vertical" className="h-full py-2" />
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ModeToggle className="size-12 rounded-full" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Theme</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </TooltipProvider>
    
      </footer>

    );
}