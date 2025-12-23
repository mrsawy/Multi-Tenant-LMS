
import {
  IconCamera,
  IconCategory,
  IconChartBar,
  IconChecklist,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconHome2,
  IconInnerShadowTop,
  IconListDetails,
  IconPhoto,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCalendarStats,
} from "@tabler/icons-react"

export const data = {

  navMain: [
    {
      title: "Courses",
      url: "/organization-dashboard/courses",
      icon: IconDashboard,
      key: "courses",
    },
    {
      title: "Categories",
      url: "/organization-dashboard/categories",
      icon: IconCategory,
      key: "Categories",
    },
    {
      title: "Users",
      url: "/organization-dashboard/users",
      icon: IconUsers,
      key: "users",
    },
    {
      title: "Enrollments",
      url: "/organization-dashboard/enrollments",
      icon: IconChecklist,
      key: "enrollments",
    },
    {
      title: "Gallery",
      url: "/organization-dashboard/gallery",
      icon: IconPhoto,
      key: "gallery",
    },
    {
      title: "My Pages",
      url: "/organization-dashboard/my-pages",
      icon: IconHome2,
      key: "home_page",
    },
    {
      title: "Attendance",
      url: "/organization-dashboard/attendance",
      icon: IconCalendarStats,
      key: "attendance",
    },
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