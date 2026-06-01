"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
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
import type { User, Role, UserForm } from "@/lib/types"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)

  const isEditing = !!user

  useEffect(() => {
    if (open) {
      fetchRoles()
      if (user) {
        setName(user.name)
        setEmail(user.email)
        setPassword("")
        setRoleId(user.role?.id || "")
        setIsActive(user.is_active)
      } else {
        resetForm()
      }
    }
  }, [open, user])

  const fetchRoles = async () => {
    setIsLoadingRoles(true)
    try {
      const response = await api.getRoles()
      if (response.success && response.data) {
        setRoles(response.data.items ?? [])
      }
    } catch {
      toast.error("Failed to load roles")
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
    setRoleId("")
    setIsActive(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || (!isEditing && !password) || !roleId) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const formData: UserForm = {
        name,
        email,
        role_id: roleId,
        is_active: isActive,
      }

      if (password) {
        formData.password = password
      }

      if (isEditing && user) {
        await api.updateUser(user.id, formData)
        toast.success("User updated successfully")
      } else {
        formData.password = password
        await api.createUser(formData)
        toast.success("User created successfully")
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information below."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                Password {isEditing && "(leave blank to keep current)"}
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "••••••••" : "Enter password"}
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                value={roleId}
                onValueChange={setRoleId}
                disabled={isSubmitting || isLoadingRoles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="is_active" className="mb-0">
                  Active Status
                </FieldLabel>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isSubmitting}
                />
              </div>
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
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
