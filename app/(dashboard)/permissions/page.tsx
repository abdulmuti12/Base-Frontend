"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "@/components/data-table"
import { PermissionFormDialog } from "@/components/permission-form-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Permission } from "@/lib/types"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getPermissions()
      if (response.success && response.data) {
        setPermissions(response.data.items ?? [])
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsFormOpen(true)
  }

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPermission) return

    setIsDeleting(true)
    try {
      await api.deletePermission(selectedPermission.id)
      toast.success("Permission deleted successfully")
      fetchPermissions()
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = () => {
    setSelectedPermission(null)
    setIsFormOpen(true)
  }

  const columns: Column<Permission>[] = [
    {
      key: "name",
      header: "Name",
      render: (permission) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">{permission.name}</code>
      ),
    },
    { key: "description", header: "Description" },
    {
      key: "actions",
      header: "Actions",
      render: (permission) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(permission)}
            title="Edit permission"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(permission)}
            title="Delete permission"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Manage system permissions for role-based access control.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={permissions}
        isLoading={isLoading}
        emptyMessage="No permissions found. Create your first permission."
      />

      <PermissionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        permission={selectedPermission}
        onSuccess={fetchPermissions}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Permission"
        description={`Are you sure you want to delete "${selectedPermission?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
