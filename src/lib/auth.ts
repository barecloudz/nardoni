import { supabase, signIn as supabaseSignIn, signOut as supabaseSignOut, getCurrentUser as getSupabaseUser } from './supabase'
import { User, AuthState } from './types'

class AuthService {
  private static instance: AuthService
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    this.authState.isLoading = true

    try {
      const { data, error } = await supabaseSignIn(email, password)

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: this.getUserRole(data.user),
          avatar: data.user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date()
        }

        this.authState.user = user
        this.authState.isAuthenticated = true

        return { success: true, user }
      }

      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      this.authState.isLoading = false
    }
  }

  async logout(): Promise<void> {
    await supabaseSignOut()
    this.authState.user = null
    this.authState.isAuthenticated = false
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { user: supabaseUser, error } = await getSupabaseUser()
      
      if (error || !supabaseUser) {
        this.authState.user = null
        this.authState.isAuthenticated = false
        return null
      }
      
      const user: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: this.getUserRole(supabaseUser),
        avatar: supabaseUser.user_metadata?.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
        createdAt: new Date(supabaseUser.created_at),
        updatedAt: new Date()
      }
      
      this.authState.user = user
      this.authState.isAuthenticated = true
      return user
    } catch (error) {
      this.authState.user = null
      this.authState.isAuthenticated = false
      return null
    }
  }

  getAuthState(): AuthState {
    return this.authState
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  private getUserRole(user: any): 'admin' | 'client' {
    // Check user metadata role
    if (user.user_metadata?.role === 'admin') {
      return 'admin'
    }

    // Default to client
    return 'client'
  }
}

export const authService = AuthService.getInstance()