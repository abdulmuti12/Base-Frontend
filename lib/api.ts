import type {
  ApiResponse,
  PaginatedData,
  User,
  Role,
  Menu,
  Permission,
  LoginForm,
  LoginResponse,
  UserForm,
  RoleForm,
  MenuForm,
  PermissionForm,
  Category,
  CategoryForm,
} from "./types"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").trim()
const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1").trim()

function buildApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL in .env.local")
  }

  const normalizedBase = API_BASE_URL.replace(/\/+$/, "")
  const normalizedPrefix = API_PREFIX
    ? `/${API_PREFIX.replace(/^\/+|\/+$/g, "")}`
    : ""

  return `${normalizedBase}${normalizedPrefix}`
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = buildApiBaseUrl()
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid/expired, clear and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
      }
      throw new Error(data.message || "Request failed")
    }

    return data
  }

  // Auth
  async login(form: LoginForm): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/profile")
  }

  // Users
  async getUsers(): Promise<ApiResponse<PaginatedData<User>>> {
    return this.request<PaginatedData<User>>("/users")
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(form: UserForm): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async updateUser(id: string, form: Partial<UserForm>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Roles
  async getRoles(): Promise<ApiResponse<PaginatedData<Role>>> {
    return this.request<PaginatedData<Role>>("/roles")
  }

  async getRole(id: string): Promise<ApiResponse<Role>> {
    return this.request<Role>(`/roles/${id}`)
  }

  async createRole(form: RoleForm): Promise<ApiResponse<Role>> {
    return this.request<Role>("/roles", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async updateRole(id: string, form: Partial<RoleForm>): Promise<ApiResponse<Role>> {
    return this.request<Role>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  }

  async deleteRole(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/roles/${id}`, {
      method: "DELETE",
    })
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<null>> {
    return this.request<null>(`/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permission_ids: permissionIds }),
    })
  }

  async assignMenusToRole(
    roleId: string,
    menuIds: string[]
  ): Promise<ApiResponse<null>> {
    return this.request<null>(`/roles/${roleId}/menus`, {
      method: "POST",
      body: JSON.stringify({ menu_ids: menuIds }),
    })
  }

  // Menus
  async getMenus(): Promise<ApiResponse<PaginatedData<Menu>>> {
    return this.request<PaginatedData<Menu>>("/menus")
  }

  async getMenu(id: string): Promise<ApiResponse<Menu>> {
    return this.request<Menu>(`/menus/${id}`)
  }

  async createMenu(form: MenuForm): Promise<ApiResponse<Menu>> {
    return this.request<Menu>("/menus", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async updateMenu(id: string, form: Partial<MenuForm>): Promise<ApiResponse<Menu>> {
    return this.request<Menu>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  }

  async deleteMenu(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/menus/${id}`, {
      method: "DELETE",
    })
  }

  // Permissions
  async getPermissions(): Promise<ApiResponse<PaginatedData<Permission>>> {
    return this.request<PaginatedData<Permission>>("/permissions")
  }

  async getPermission(id: string): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(`/permissions/${id}`)
  }

  async createPermission(form: PermissionForm): Promise<ApiResponse<Permission>> {
    return this.request<Permission>("/permissions", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async updatePermission(
    id: string,
    form: Partial<PermissionForm>
  ): Promise<ApiResponse<Permission>> {
    return this.request<Permission>(`/permissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  }

  async deletePermission(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/permissions/${id}`, {
      method: "DELETE",
    })
  }
// Categories
  async getCategories(): Promise<ApiResponse<PaginatedData<Category>>> {
    return this.request<PaginatedData<Category>>("/categories")
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`)
  }

  async createCategory(form: CategoryForm): Promise<ApiResponse<Category>> {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(form),
    })
  }

  async updateCategory(
    id: string,
    form: Partial<CategoryForm>
  ): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    })
  }

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/categories/${id}`, {
      method: "DELETE",
    })
  }
}

export const api = new ApiClient()

// Error helper
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  return "Unknown error occurred"
}
