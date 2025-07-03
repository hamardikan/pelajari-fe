import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/services/api'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'

interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data: T
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface RefreshTokenResponse {
  accessToken: string
}

interface ProfileUpdateResponse {
  user: User
}

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'manager'
  managerId?: string
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: 'user' | 'manager'
  managerId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  updateProfile: (userData: Partial<User>) => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          
          const response = await apiClient.post<ApiResponse<LoginResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials)
          
          if (response.success) {
            const { user, accessToken, refreshToken } = response.data
            
            set({
              user,
              token: accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            })

            // Store tokens in localStorage for API client
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true })
          
          const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
          
          if (response.success) {
            // Auto login after successful registration
            await get().login({ email: data.email, password: data.password })
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Clear all stored data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_DATA)
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Optional: Call logout endpoint
        try {
          apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
          console.warn('Logout endpoint failed:', error)
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) throw new Error('No refresh token available')

          const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
          })

          if (response.success) {
            const { accessToken } = response.data
            
            set({ token: accessToken })
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
          } else {
            throw new Error('Token refresh failed')
          }
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          set({ isLoading: true })
          
          const { user } = get()
          if (!user) throw new Error('No user logged in')

          const response = await apiClient.put<ApiResponse<ProfileUpdateResponse>>(`/auth/users/${user.id}/profile`, userData)
          
          if (response.success) {
            set({
              user: { ...user, ...response.data.user },
              isLoading: false,
            })
          } else {
            throw new Error(response.message || 'Profile update failed')
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'pelajari-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 