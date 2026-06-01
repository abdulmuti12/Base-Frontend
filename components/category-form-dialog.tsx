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
import type { Category, CategoryForm } from "@/lib/types"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSuccess: () => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!category

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setDescription(category.description || "")
        setImage(category.image || "")
      } else {
        resetForm()
      }
    }
  }, [open, category])

  const resetForm = () => {
    setName("")
    setDescription("")
    setImage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a category name")
      return
    }

    setIsSubmitting(true)
    try {
      const formData: CategoryForm = {
        name,
        description: description || undefined,
        image: image || undefined,
      }

      if (isEditing && category) {
        await api.updateCategory(category.id, formData)
        toast.success("Category updated successfully")
      } else {
        await api.createCategory(formData)
        toast.success("Category created successfully")
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
            {isEditing ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update category information below."
              : "Fill in the details to create a new category."}
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
                placeholder="e.g., Electronics"
                disabled={isSubmitting}
                maxLength={50}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description (max 50 chars)"
                disabled={isSubmitting}
                maxLength={50}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="image">Image URL</FieldLabel>
              <Input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
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
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
