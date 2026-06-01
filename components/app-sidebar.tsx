"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Shield,
  Menu as MenuIcon,
  Key,
  LogOut,
  ChevronDown,
  Settings,
  Layers,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Menu } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Icon mapping for dynamic menus
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  users: Users,
  shield: Shield,
  menu: MenuIcon,
  key: Key,
  settings: Settings,
  layers: Layers,
}

// Default menus fallback
const defaultMenus = [
  { id: "dashboard", name: "Dashboard", path: "/dashboard", icon: "home", order: 1 },
  { id: "users", name: "Users", path: "/users", icon: "users", order: 2 },
  { id: "roles", name: "Roles", path: "/roles", icon: "shield", order: 3 },
  { id: "menus", name: "Menus", path: "/menus", icon: "menu", order: 4 },
  { id: "permissions", name: "Permissions", path: "/permissions", icon: "key", order: 5 },
  { id: "categories", name: "Categories", path: "/categories", icon: "layers", order: 6 },
]

export function AppSidebar() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    async function fetchMenus() {
      try {
        const response = await api.getMenus()
        const items = response.data?.items ?? []
        if (response.success && items.length > 0) {
          setMenus(items)
        } else {
          // Use default menus if API returns empty
          setMenus(defaultMenus as Menu[])
        }
      } catch {
        // Use default menus on error
        setMenus(defaultMenus as Menu[])
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenus()
  }, [])

  const sortedMenus = [...menus].sort((a, b) => a.order - b.order)

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Home
    return Icon
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">RBAC Admin</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton disabled>
                      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                sortedMenus.map((menu) => {
                  const Icon = getIcon(menu.icon)
                  const isActive = pathname === menu.path || pathname.startsWith(menu.path)
                  return (
                    <SidebarMenuItem key={menu.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={menu.path}>
                          <Icon className="h-4 w-4" />
                          <span>{menu.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col text-left text-sm">
                    <span className="truncate font-medium">{user?.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role?.name || "Role"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
