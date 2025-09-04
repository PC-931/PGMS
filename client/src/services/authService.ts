// import { User, LoginCredentials, RegisterData, ApiResponse } from '../types'

// // Mock API service - Replace with actual API calls
// class AuthService {
//   //private baseURL = 'http://localhost:3001/api/auth'
//   private baseURL = 'http://localhost:3001/api/auth'
  
//   // Mock users database
//   private mockUsers: Array<User & { password: string }> = [
//     {
//       id: '1',
//       email: 'admin@example.com',
//       password: 'admin123', // In real app, this would be hashed
//       name: 'Admin User',
//       role: 'ADMIN',
//       createdAt: '2024-01-01T00:00:00Z',
//       updatedAt: '2024-01-01T00:00:00Z'
//     },
//     {
//       id: '2',
//       email: 'tenant@example.com',
//       password: 'tenant123',
//       name: 'John Tenant',
//       role: 'TENANT',
//       createdAt: '2024-01-01T00:00:00Z',
//       updatedAt: '2024-01-01T00:00:00Z'
//     }
//   ]

//   async login(email: string, password: string): Promise<{ user: User; token: string }> {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     const user = this.mockUsers.find(u => u.email === email)
    
//     if (!user) {
//       throw new Error('Invalid email or password')
//     }

//     // In a real app, you'd use bcrypt to compare hashed passwords
//     if (user.password !== password) {
//       throw new Error('Invalid email or password')
//     }

//     // Generate mock JWT token (in real app, this comes from server)
//     const token = `mock_token_${user.id}_${Date.now()}`
    
//     // Remove password from user object
//     const { password: _, ...userWithoutPassword } = user
    
//     return {
//       user: userWithoutPassword,
//       token
//     }
//   }

//   async register(userData: RegisterData): Promise<{ user: User; token: string }> {
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // Check if user already exists
//     const existingUser = this.mockUsers.find(u => u.email === userData.email)
//     if (existingUser) {
//       throw new Error('User with this email already exists')
//     }

//     // Create new user
//     const newUser = {
//       id: Date.now().toString(),
//       email: userData.email,
//       password: userData.password, // In real app, hash this
//       name: userData.name,
//       role: userData.role || 'TENANT' as const,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     }

//     this.mockUsers.push(newUser)
    
//     const token = `mock_token_${newUser.id}_${Date.now()}`
//     const { password: _, ...userWithoutPassword } = newUser
    
//     return {
//       user: userWithoutPassword,
//       token
//     }
//   }

//   async getCurrentUser(): Promise<User> {
//     // In real app, validate JWT token and return user
//     await new Promise(resolve => setTimeout(resolve, 500))
    
//     // Mock implementation - get user from token
//     const token = document.cookie
//       .split('; ')
//       .find(row => row.startsWith('auth_token='))
//       ?.split('=')[1]

//     if (!token) {
//       throw new Error('No token found')
//     }

//     // Extract user ID from mock token
//     const userId = token.split('_')[2]
//     const user = this.mockUsers.find(u => u.id === userId)
    
//     if (!user) {
//       throw new Error('User not found')
//     }

//     const { password: _, ...userWithoutPassword } = user
//     return userWithoutPassword
//   }

//   async refreshToken(): Promise<string> {
//     await new Promise(resolve => setTimeout(resolve, 500))
//     return `refreshed_token_${Date.now()}`
//   }

//   async forgotPassword(email: string): Promise<void> {
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     const user = this.mockUsers.find(u => u.email === email)
//     if (!user) {
//       throw new Error('User not found')
//     }
    
//     // In real app, send password reset email
//     console.log(`Password reset email sent to ${email}`)
//   }

//   async resetPassword(token: string, newPassword: string): Promise<void> {
//     await new Promise(resolve => setTimeout(resolve, 1000))
//     // In real app, validate reset token and update password
//     console.log('Password reset successfully')
//   }
// }

// export const authService = new AuthService()

import api from './api';
import { User, RegisterData } from '../types';

class AuthService {
  private baseURL = '/auth'; // since api.ts already has /api

  async login(email: string, password: string, rememberMe: boolean): Promise<{ user: User; token: string }> {
    
    try {
      const response = await api.post(`${this.baseURL}/login`, { email, password, rememberMe });

      const { user, token } = response.data;

      // Store token in localStorage (or cookies if you prefer httpOnly)
      localStorage.setItem('auth_token', token);

      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post(`${this.baseURL}/register`, userData);

      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);

      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get(`${this.baseURL}/me`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Unable to fetch user');
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await api.post(`${this.baseURL}/refresh-token`);
      const { token } = response.data;

      localStorage.setItem('auth_token', token);
      return token;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refresh token');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post(`${this.baseURL}/forgot-password`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post(`${this.baseURL}/reset-password`, { token, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseURL}/logout`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }
}

export const authService = new AuthService();

