"use client"

import { Calendar } from "@/components/atoms/calendar";
import { AppSidebar } from "@/components/molecules/app-sidebar";
import Calendar05 from "@/components/molecules/calendar-05";
import CalendarWithTodayButton from "@/components/molecules/calendar-with-today-button";
import FullCalendar from "@/components/organs/full-calendar";
import { IUser } from "@/lib/types/user/user.interface";
import {
  IconCalendarUser,
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
  IconWallet,
} from "@tabler/icons-react"

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
      icon: IconWallet,
      key: "Wallet",
    },
    {
      title: "Calendar",
      url: "/student-dashboard/calendar",
      icon: IconCalendarUser,
      key: "calendar",
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

  documentComponent: <CalendarWithTodayButton />
}


export function StudentSidebar({ user }: { user?: IUser }) {
  return <AppSidebar data={{
    ...data, user: {
      name: user?.firstName,
      email: user?.email
    }
  }} variant="inset" />

}