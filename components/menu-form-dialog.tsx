"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Menu, MenuForm } from "@/lib/types"

const iconOptions = [
  { value: "home", label: "Home" },
  { value: "users", label: "Users" },
  { value: "shield", label: "Shield" },
  { value: "menu", label: "Menu" },
  { value: "key", label: "Key" },
  { value: "settings", label: "Settings" },
]

interface MenuFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu | null
  onSuccess: () => void
}

export function MenuFormDialog({
  open,
  onOpenChange,
  menu,
  onSuccess,
}: MenuFormDialogProps) {
  const [name, setName] = useState("")
  const [path, setPath] = useState("")
  const [icon, setIcon] = useState("home")
  const [order, setOrder] = useState(1)
  const [parentId, setParentId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [menus, setMenus] = useState<Menu[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)

  const isEditing = !!menu

  useEffect(() => {
    if (open) {
      fetchMenus()
      if (menu) {
        setName(menu.name)
        setPath(menu.path)
        setIcon(menu.icon)
        setOrder(menu.order)
        setParentId(menu.parent_id)
        setIsActive(menu.is_active !== undefined ? menu.is_active : true)
      } else {
        resetForm()
      }
    }
  }, [open, menu])

  const fetchMenus = async () => {
    setIsLoadingMenus(true)
    try {
      const response = await api.getMenus()
      if (response.success && response.data) {
        setMenus(response.data.items ?? [])
      }
    } catch {
      // Silent fail - parent selection is optional
    } finally {
      setIsLoadingMenus(false)
    }
  }

  const resetForm = () => {
    setName("")
    setPath("")
    setIcon("home")
    setOrder(1)
    setParentId(null)
    setIsActive(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !path) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const formData: MenuForm = {
        name,
        path,
        icon,
        order,
        parent_id: parentId,
        is_active: isActive,
      }

      if (isEditing && menu) {
        await api.updateMenu(menu.id, formData)
        toast.success("Menu updated successfully")
      } else {
        await api.createMenu(formData)
        toast.success("Menu created successfully")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter out current menu from parent options to prevent circular reference
  const parentOptions = menus.filter((m) => m.id !== menu?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Menu" : "Create Menu"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update menu information below."
              : "Fill in the details to create a new menu item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Menu Name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., User Management"
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="path">Path</FieldLabel>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="e.g., /users"
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="icon">Icon</FieldLabel>
              <Select value={icon} onValueChange={setIcon} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="order">Order</FieldLabel>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                min={1}
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="parent">Parent Menu (Optional)</FieldLabel>
              <Select
                value={parentId || "none"}
                onValueChange={(val) => setParentId(val === "none" ? null : val)}
                disabled={isSubmitting || isLoadingMenus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent (Top Level)</SelectItem>
                  {parentOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div>
                <FieldLabel htmlFor="is_active" className="!mb-0">
                  Active Status
                </FieldLabel>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable or disable this menu item
                </p>
              </div>
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
                disabled={isSubmitting}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
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
                "Update Menu"
              ) : (
                "Create Menu"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
