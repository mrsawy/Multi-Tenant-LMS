"use client"

import { AppSidebar } from "@/components/molecules/app-sidebar";
import { IUser } from "@/lib/types/user/user.interface";



import {
  IconCamera,
  IconCategory,
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
} from "@tabler/icons-react"
import { Wallet2Icon } from "lucide-react";

export const data = {

  navMain: [
    {
      title: "Courses",
      url: "/student-dashboard/courses",
      icon: IconDashboard,
      key: "courses",
    },
    {
      title: "Wallet",
      url: "/student-dashboard/wallet",
      icon: Wallet2Icon,
      key: "Wallet",
    },
    // {
    //   title: "Users",
    //   url: "/organization-dashboard/users",
    //   icon: IconUsers,
    //   key: "users",
    // },
    // {
    //   title: "Lifecycle",
    //   url: "#",
    //   icon: IconListDetails,
    // },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Projects",
    //   url: "#",
    //   icon: IconFolder,
    // },
    // {
    //   title: "Team",
    //   url: "#",
    //   icon: IconUsers,
    // },
  ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: IconFileWord,
  //   },
  // ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}


export function StudentSidebar({ user }: { user?: IUser }) {
  return <AppSidebar data={{
    ...data, user: {
      name: user?.firstName,
      email: user?.email
    }
  }} variant="inset" />

}