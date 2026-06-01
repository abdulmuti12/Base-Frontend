"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/data-table"
import { UserFormDialog } from "@/components/user-form-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { User } from "@/lib/types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getUsers()
      if (response.success && response.data) {
        setUsers(response.data.items ?? [])
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    setIsDeleting(true)
    try {
      await api.deleteUser(selectedUser.id)
      toast.success("User deleted successfully")
      fetchUsers()
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const columns: Column<User>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge variant="secondary">{user.role?.name || "-"}</Badge>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (user) => (
        <Badge variant={user.is_active ? "default" : "outline"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(user)}
            title="Edit user"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(user)}
            title="Delete user"
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
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their roles.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found. Create your first user."
      />

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
