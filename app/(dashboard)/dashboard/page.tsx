"use client"

import { useEffect, useState } from "react"
import { Users, Shield, Menu, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Stats {
  users: number
  roles: number
  menus: number
  permissions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, roles: 0, menus: 0, permissions: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, rolesRes, menusRes, permissionsRes] = await Promise.all([
          api.getUsers(),
          api.getRoles(),
          api.getMenus(),
          api.getPermissions(),
        ])

        setStats({
          users: usersRes.data?.pagination?.total_items || 0,
          roles: rolesRes.data?.pagination?.total_items || 0,
          menus: menusRes.data?.pagination?.total_items || 0,
          permissions: permissionsRes.data?.pagination?.total_items || 0,
        })
      } catch {
        // Keep default values on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      description: "Registered users in system",
      icon: Users,
    },
    {
      title: "Total Roles",
      value: stats.roles,
      description: "Defined access roles",
      icon: Shield,
    },
    {
      title: "Total Menus",
      value: stats.menus,
      description: "Navigation menu items",
      icon: Menu,
    },
    {
      title: "Total Permissions",
      value: stats.permissions,
      description: "Available permissions",
      icon: Key,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your RBAC system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-12 animate-pulse rounded bg-muted" />
                ) : (
                  stat.value
                )}
              </div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Current logged in user information</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Name</dt>
              <dd className="text-sm">{user?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm">{user?.email || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Role</dt>
              <dd className="text-sm">{user?.role?.name || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    user?.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user?.is_active ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
