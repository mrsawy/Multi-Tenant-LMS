"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/atoms/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/atoms/sidebar"
import { ModeToggle, ThemeToggler } from "./theme-switcher"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon,
    key: string
  }[]
}) {
  const pathname = usePathname();
  const t = useTranslations("StudentSidebar");

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip={t("quickCreate")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />

              <span>{t("quickCreate")}</span>
            </SidebarMenuButton>
            {/* <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />

              <span className="sr-only">Inbox</span>
            </Button> */}
            <ThemeToggler />

          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <Link href={item.url} key={item.key}
            >
              <SidebarMenuItem key={item.title} className=""
              >
                <SidebarMenuButton
                  className={cn("cursor-pointer", pathname.includes(item.url) ? "bg-accent/95 text-secondary" : "")}

                  tooltip={item.title} >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
