import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthContextType } from '../types'
import { authService } from '../services/authService'
import Cookies from 'js-cookie'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('auth_token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get current user:', error)
          Cookies.remove('auth_token')
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean): Promise<void> => {
    setIsLoading(true)
    try {
      const { user: userData, token } = await authService.login(email, password, rememberMe)      
      // Store token in httpOnly cookie (simulated with secure cookie)
      Cookies.set('auth_token', token, { 
        expires: 7, // 7 days
        secure:  true,
        sameSite: 'strict'
      })      
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    Cookies.remove('auth_token')
    localStorage.removeItem('auth_token')

    setUser(null)
    // Clear any other stored data
    localStorage.removeItem('user_preferences')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}