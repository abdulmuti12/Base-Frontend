"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/data-table"
import { MenuFormDialog } from "@/components/menu-form-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { toast } from "sonner"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Menu } from "@/lib/types"

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMenus = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getMenus()
      if (response.success && response.data) {
        setMenus(response.data.items ?? [])
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsFormOpen(true)
  }

  const handleDelete = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMenu) return

    setIsDeleting(true)
    try {
      await api.deleteMenu(selectedMenu.id)
      toast.success("Menu deleted successfully")
      fetchMenus()
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreate = () => {
    setSelectedMenu(null)
    setIsFormOpen(true)
  }

  const columns: Column<Menu>[] = [
    { key: "name", header: "Name" },
    { key: "path", header: "Path" },
    {
      key: "icon",
      header: "Icon",
      render: (menu) => <Badge variant="outline">{menu.icon}</Badge>,
    },
    {
      key: "order",
      header: "Order",
      render: (menu) => <span className="font-mono">{menu.order}</span>,
    },
    {
      key: "parent_id",
      header: "Parent",
      render: (menu) => {
        if (!menu.parent_id) return <span className="text-muted-foreground">-</span>
        const parent = menus.find((m) => m.id === menu.parent_id)
        return parent ? (
          <Badge variant="secondary">{parent.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (menu) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(menu)}
            title="Edit menu"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(menu)}
            title="Delete menu"
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
          <h1 className="text-2xl font-bold tracking-tight">Menus</h1>
          <p className="text-muted-foreground">
            Manage navigation menu items for the sidebar.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={menus}
        isLoading={isLoading}
        emptyMessage="No menus found. Create your first menu."
      />

      <MenuFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        menu={selectedMenu}
        onSuccess={fetchMenus}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Menu"
        description={`Are you sure you want to delete "${selectedMenu?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
