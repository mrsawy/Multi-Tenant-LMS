"use client"

import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"

import { NavDocuments } from "@/components/molecules/nav-documents"
import { NavMain } from "@/components/molecules/nav-main"
import { NavSecondary } from "@/components/molecules/nav-secondary"
import { NavUser } from "@/components/molecules/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/atoms/sidebar"
import { useLocale, useTranslations } from "next-intl"
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: {
    navMain?: any[];
    documents?: any[];
    navSecondary?: any[];
    user?: any;
    documentComponent?: React.ReactNode;
  };
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations("AppSidebar");

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props} side={isRTL ? 'right' : 'left'} >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                {/* <IconInnerShadowTop className="!size-5" /> */}

                <span className="text-base font-semibold">{t("appName")}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain && <NavMain items={data.navMain} />}
        {data.documents && <NavDocuments items={data.documents} />}
        {data.documentComponent && data.documentComponent}
        {data.navSecondary && <NavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
