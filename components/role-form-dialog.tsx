"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Role, Permission, Menu } from "@/lib/types"

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSuccess: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [selectedMenus, setSelectedMenus] = useState<string[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const isEditing = !!role

  useEffect(() => {
    if (open) {
      fetchData()
      if (role) {
        setName(role.name)
        setDescription(role.description)
        setSelectedPermissions(role.permissions?.map((p) => p.id) || [])
        setSelectedMenus(role.menus?.map((m) => m.id) || [])
      } else {
        resetForm()
      }
    }
  }, [open, role])

  const fetchData = async () => {
    setIsLoadingData(true)
    try {
      const [permRes, menuRes] = await Promise.all([
        api.getPermissions(),
        api.getMenus(),
      ])
      if (permRes.success && permRes.data) {
        setPermissions(permRes.data.items ?? [])
      }
      if (menuRes.success && menuRes.data) {
        setMenus(menuRes.data.items ?? [])
      }
    } catch {
      toast.error("Failed to load data")
    } finally {
      setIsLoadingData(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setSelectedPermissions([])
    setSelectedMenus([])
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    )
  }

  const toggleMenu = (menuId: string) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a role name")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = {
        name,
        description,
        permission_ids: selectedPermissions,
        menu_ids: selectedMenus,
      }

      if (isEditing && role) {
        await api.updateRole(role.id, formData)
        toast.success("Role updated successfully")
      } else {
        await api.createRole(formData)
        toast.success("Role created successfully")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update role information and access rights."
              : "Create a new role with permissions and menu access."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="menus">Menus</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Role Name</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., manager"
                    disabled={isSubmitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the role..."
                    disabled={isSubmitting}
                    rows={3}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="permissions" className="mt-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : permissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No permissions available.
                </p>
              ) : (
                <ScrollArea className="h-[250px] rounded-md border p-4">
                  <div className="space-y-3">
                    {permissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor={`perm-${perm.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="text-sm font-medium">{perm.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {perm.description}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="menus" className="mt-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : menus.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No menus available.
                </p>
              ) : (
                <ScrollArea className="h-[250px] rounded-md border p-4">
                  <div className="space-y-3">
                    {menus.map((menu) => (
                      <div
                        key={menu.id}
                        className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`menu-${menu.id}`}
                          checked={selectedMenus.includes(menu.id)}
                          onCheckedChange={() => toggleMenu(menu.id)}
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor={`menu-${menu.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="text-sm font-medium">{menu.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {menu.path}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Role"
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
