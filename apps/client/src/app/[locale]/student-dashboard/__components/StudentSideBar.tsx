"use client"

import { AppSidebar } from "@/components/molecules/app-sidebar";
import CalendarWithTodayButton from "@/components/molecules/calendar-with-today-button";
import { IUser } from "@/lib/types/user/user.interface";
import {
  IconCalendarUser,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react"
import { useTranslations } from "next-intl"

export const useStudentSidebarData = () => {
  const t = useTranslations("StudentSidebar");

  return {
    navMain: [
      {
        title: t("navMain.courses"),
        url: "/student-dashboard/courses",
        icon: IconDashboard,
        key: "courses",
      },
      {
        title: t("navMain.wallet"),
        url: "/student-dashboard/wallet",
        icon: IconWallet,
        key: "Wallet",
      },
      {
        title: t("navMain.calendar"),
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
        title: t("navSecondary.settings"),
        url: "#",
        icon: IconSettings,
      },
      {
        title: t("navSecondary.getHelp"),
        url: "#",
        icon: IconHelp,
      },
      {
        title: t("navSecondary.search"),
        url: "#",
        icon: IconSearch,
      },
    ],

    documentComponent: <CalendarWithTodayButton />
  };
}


export function StudentSidebar({ user }: { user?: IUser }) {
  const data = useStudentSidebarData();

  return <AppSidebar data={{
    ...data, user: {
      name: user?.firstName,
      email: user?.email
    }
  }} variant="inset" />

}