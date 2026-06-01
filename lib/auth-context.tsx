"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { api, getApiErrorMessage } from "./api"
import type { User, LoginForm } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (form: LoginForm) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const response = await api.getProfile()
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem("user", JSON.stringify(response.data))
      } else {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
      }
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Try to restore session on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Invalid JSON, ignore
      }
    }
    refreshUser()
  }, [refreshUser])

  const login = async (form: LoginForm) => {
    try {
      const response = await api.login(form)
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        setUser(response.data.user)
        router.push("/dashboard")
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (err) {
      throw new Error(getApiErrorMessage(err))
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
