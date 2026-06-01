// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    limit: number
    page: number
    total_items: number
    total_pages: number
  }
}

// Auth Types
export interface Role {
  id: string
  name: string
  description: string
  permissions?: Permission[]
  menus?: Menu[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  name: string
  email: string
  is_active: boolean
  role: Role
  role_id?: string
  created_at?: string
  updated_at?: string
}

export interface LoginResponse {
  token: string
  user: User
}

// Permission Types
export interface Permission {
  id: string
  name: string
  description: string
  created_at?: string
  updated_at?: string
}

// Menu Types
export interface Menu {
  id: string
  name: string
  path: string
  icon: string
  order: number
  parent_id: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface UserForm {
  name: string
  email: string
  password?: string
  role_id: string
  is_active?: boolean
}

export interface RoleForm {
  name: string
  description: string
  permission_ids?: string[]
  menu_ids?: string[]
}

export interface MenuForm {
  name: string
  path: string
  icon: string
  order: number
  parent_id?: string | null
  is_active?: boolean
}

export interface PermissionForm {
  name: string
  description: string
}

// Category Types
export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  created_at?: string
  updated_at?: string
}

export interface CategoryForm {
  name: string
  description?: string
  image?: string
}

// Sidebar Menu Type
export interface SidebarMenuItem {
  key: string
  label: string
  to: string
  icon: string
  children?: SidebarMenuItem[]
}
