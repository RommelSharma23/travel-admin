// lib/auth/admin-auth.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'content_manager' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  user_id: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

export class AdminAuth {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Login with email and password using Supabase Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (!authData.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Step 2: Get admin user data from admin_users table
      const { data: adminUser, error: adminError } = await this.supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        // Sign out the user since they're not an admin
        await this.supabase.auth.signOut();
        return { success: false, error: 'Access denied. Admin account required.' };
      }

      // Step 3: Update last login
      await this.supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      // Step 4: Store session info
      const sessionData = {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          first_name: adminUser.first_name,
          last_name: adminUser.last_name,
          role: adminUser.role,
          is_active: adminUser.is_active,
          last_login: adminUser.last_login,
          created_at: adminUser.created_at,
          user_id: adminUser.user_id
        },
        loginTime: Date.now(),
        supabaseSession: authData.session
      };

      localStorage.setItem('admin_session', JSON.stringify(sessionData));

      // Log activity (without sensitive data)
      await this.logActivity(adminUser.id, 'login', null, null, null);

      return { success: true, user: sessionData.user };
    } catch (error) {
      // Only log generic error in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Get current user from session
  getCurrentUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const session = localStorage.getItem('admin_session');
      if (!session) return null;

      const sessionData = JSON.parse(session);
      
      // Check if session is expired (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - sessionData.loginTime > maxAge) {
        this.logout();
        return null;
      }

      return sessionData.user;
    } catch {
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session');
    }
    // Also sign out from Supabase
    await this.supabase.auth.signOut();
  }

  // Check if user has permission
  hasPermission(user: AdminUser | null, permission: string): boolean {
    if (!user || !user.is_active) return false;

    const permissions = {
      super_admin: ['*'], // All permissions
      content_manager: [
        'destinations:read', 'destinations:write', 'destinations:delete',
        'categories:read', 'categories:write', 'categories:delete',
        'packages:read', 'packages:write', 'packages:delete',
        'blogs:read', 'blogs:write', 'blogs:delete',
        'media:read', 'media:write', 'media:delete',
        'inquiries:read', 'inquiries:write', 'inquiries:update',
        'pdf:generate', 'pdf:download'
      ],
      staff: [
        'inquiries:read', 'inquiries:write', 'inquiries:update',
        'pdf:generate', 'pdf:download'
      ]
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Log admin activity
  private async logActivity(
    adminUserId: string, 
    action: string, 
    tableName: string | null, 
    recordId: string | null, 
    changes: any
  ) {
    try {
      await this.supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: adminUserId,
          action,
          table_name: tableName,
          record_id: recordId,
          new_values: changes,
          ip_address: null,
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : null
        });
    } catch (error) {
      // Silently fail - don't expose logging errors
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to log activity:', error);
      }
    }
  }

  // Create new admin user (super_admin only)
  async createAdminUser(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'super_admin' | 'content_manager' | 'staff';
  }, createdBy: string): Promise<AuthResponse> {
    try {
      // Step 1: Create Supabase Auth user
      const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError || !authUser.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Step 2: Create admin user record
      const { data: adminUser, error: adminError } = await this.supabase
        .from('admin_users')
        .insert({
          user_id: authUser.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          created_by: createdBy
        })
        .select()
        .single();

      if (adminError) {
        // If admin user creation fails, clean up auth user
        await this.supabase.auth.admin.deleteUser(authUser.user.id);
        return { success: false, error: 'Failed to create admin record' };
      }

      // Log activity
      await this.logActivity(createdBy, 'create_user', 'admin_users', adminUser.id, { email: userData.email, role: userData.role });

      return { success: true, user: adminUser };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Create user error:', error);
      }
      return { success: false, error: 'Failed to create user' };
    }
  }
}

// Export singleton instance
export const adminAuth = new AdminAuth();