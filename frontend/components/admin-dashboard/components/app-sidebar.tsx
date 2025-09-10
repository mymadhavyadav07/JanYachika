"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconLayoutSidebarRightExpand
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

import { projectName } from "@/data/data";
import { Button } from "@/components/ui/button";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard
    },
    {
      title: "Pending Issues",
      url: "/admin/pending-issues",
      icon: IconListDetails
    },
    {
      title: "In-Progress Issues",
      url: "/admin/in-progress-issues",
      icon: IconChartBar
    },
    {
      title: "Resolved Issues",
      url: "/admin/resolved-issues",
      icon: IconFolder
    },
    {
      title: "Officers",
      url: "/admin/officers",
      icon: IconUsers
    }
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch
    }
  ],
  documents: [
    {
      name: "Review issues",
      url: "/admin/review-issues",
      icon: IconDatabase
    },
    {
      name: "Review officer registration",
      url: "#",
      icon: IconReport
    }
  ]
};



export function AppSidebar({...props }: React.ComponentProps<typeof Sidebar>) {
  

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="h-auto border-r" {...props}>
      
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row">
            <SidebarMenuButton asChild>
              <Link href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{projectName}</span>
              </Link>
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
