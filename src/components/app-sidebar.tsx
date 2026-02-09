"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookHeart,
  BookOpen,
  Bot,
  ChartNoAxesGantt,
  Command,
  Frame,
  GalleryVerticalEnd,
  Instagram,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Sofia Delis",
      logo: ChartNoAxesGantt,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Model",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Images",
          url: "/model/images",
        },
        {
          title: "Videos",
          url: "/model/videos",
        },
        {
          title: "Gallery",
          url: "/model/gallery",
        },
      ],
    },
    {
      title: "Fanvue",
      url: "#",
      icon: BookHeart,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Chats",
          url: "#",
        },
        {
          title: "Posts",
          url: "#",
        },
        {
          title: "Vault",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Instagram",
      url: "#",
      icon: Instagram,
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Chats",
          url: "#",
        },
        {
          title: "Posts",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
/* projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ], */
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
