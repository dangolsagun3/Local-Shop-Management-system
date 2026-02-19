'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  user: any | null
  isauthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (userData: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implement actual login API call
      // const response = await fetch('/api/auth/login', { ... })
      const mockToken = 'mock-jwt-token'
      const mockUser = { email, name: 'Shop Owner' }
      setToken(mockToken)
      setUser(mockUser)
      localStorage.setItem('token', mockToken)
    } catch (error) {
      throw new Error('Login failed')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const signup = async (userData: any) => {
    try {
      // TODO: Implement actual signup API call
      const mockToken = 'mock-jwt-token'
      setToken(mockToken)
      setUser(userData)
      localStorage.setItem('token', mockToken)
    } catch (error) {
      throw new Error('Signup failed')
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
