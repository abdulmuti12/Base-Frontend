"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Permission, PermissionForm } from "@/lib/types"

interface PermissionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission?: Permission | null
  onSuccess: () => void
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
  onSuccess,
}: PermissionFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!permission

  useEffect(() => {
    if (open) {
      if (permission) {
        setName(permission.name)
        setDescription(permission.description)
      } else {
        resetForm()
      }
    }
  }, [open, permission])

  const resetForm = () => {
    setName("")
    setDescription("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a permission name")
      return
    }

    setIsSubmitting(true)
    try {
      const formData: PermissionForm = {
        name,
        description,
      }

      if (isEditing && permission) {
        await api.updatePermission(permission.id, formData)
        toast.success("Permission updated successfully")
      } else {
        await api.createPermission(formData)
        toast.success("Permission created successfully")
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
          <DialogTitle>
            {isEditing ? "Edit Permission" : "Create Permission"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update permission information below."
              : "Fill in the details to create a new permission."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="name">Permission Name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., user:create"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use format like resource:action (e.g., user:create, role:delete)
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this permission allows..."
                disabled={isSubmitting}
                rows={3}
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
                "Update Permission"
              ) : (
                "Create Permission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
