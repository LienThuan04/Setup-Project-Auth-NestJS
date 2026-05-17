"use client"

import * as React from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, ShieldCogIcon, Settings2Icon } from "lucide-react"
import { useAppSelector } from "@/redux/hooks"
import { ROUTES } from "@/lib/routes"
import { ROLES } from "@/constants/roles"
import { NavMain } from "@/components/layout/NavMain"
import { NavUser } from "@/components/layout/NavUser"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAppSelector((state) => state.auth.user)
  const isAdmin = user?.roleName === ROLES.ADMIN

  const navItems = [
    ...(isAdmin ? [{
      title: "Management",
      url: ROUTES.DASHBOARD.USER_MANAGEMENT,
      icon: <ShieldCogIcon />,
      items: [
        { title: "Users", url: ROUTES.DASHBOARD.USER_MANAGEMENT },
        { title: "Roles", url: ROUTES.DASHBOARD.ROLE_MANAGEMENT },
      ],
    }] : []),

    {
      title: "Settings",
      url: ROUTES.DASHBOARD.SETTINGS,
      icon: <Settings2Icon />,
      items: [
        { title: "Account Settings", url: ROUTES.DASHBOARD.SETTINGS },
      ],
    },
    
  ]

  if (!user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <GalleryVerticalEndIcon className="size-5 shrink-0" />
          <span className="font-semibold text-sm truncate">Lian Harman</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
