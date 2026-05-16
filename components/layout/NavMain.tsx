"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  items?: { title: string; url: string }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  // lay pathname de xac dinh trang dang active, tu do mo nhom chua trang do
  const pathname = usePathname()

  const isGroupActive = (item: NavItem) =>
    item.items?.some((sub) => sub.url === pathname) ?? pathname === item.url

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    items.forEach((item) => { init[item.title] = isGroupActive(item) })
    return init
  })

  // Khi pathname thay đổi (navigate), tự động mở nhóm chứa trang đang active
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      items.forEach((item) => {
        if (isGroupActive(item)) next[item.title] = true
      })
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            open={openGroups[item.title] ?? false}
            onOpenChange={(val) =>
              setOpenGroups((prev) => ({ ...prev, [item.title]: val }))
            }
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} isActive={isGroupActive(item)}>
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
