"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/data-table"
import { RoleFormDialog } from "@/components/role-form-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Role } from "@/lib/types"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getRoles()
      if (response.success && response.data) {
        setRoles(response.data.items ?? [])
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleEdit = async (role: Role) => {
    // Fetch full role details to get permissions and menus
    try {
      const response = await api.getRole(role.id)
      if (response.success && response.data) {
        setSelectedRole(response.data)
        setIsFormOpen(true)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    }
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRole) return

    setIsDeleting(true)
    try {
      await api.deleteRole(selectedRole.id)
      toast.success("Role deleted successfully")
      fetchRoles()
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = () => {
    setSelectedRole(null)
    setIsFormOpen(true)
  }

  const columns: Column<Role>[] = [
    { key: "name", header: "Name" },
    { key: "description", header: "Description" },
    {
      key: "permissions",
      header: "Permissions",
      render: (role) => (
        <Badge variant="secondary">
          {role.permissions?.length || 0} permissions
        </Badge>
      ),
    },
    {
      key: "menus",
      header: "Menus",
      render: (role) => (
        <Badge variant="outline">{role.menus?.length || 0} menus</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (role) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(role)}
            title="Edit role"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(role)}
            title="Delete role"
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
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage roles and their permissions.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        emptyMessage="No roles found. Create your first role."
      />

      <RoleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        role={selectedRole}
        onSuccess={fetchRoles}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Role"
        description={`Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
