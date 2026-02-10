import supabase from '@/supabase/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// 注意：此文件中的认证方法仅用于登录状态管理
// 数据库操作（supabase.from()）始终使用 anon 角色，无需认证

export interface SupabaseAuthResponse {
  data: any;
  error: AuthError | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase 认证服务
 */
export class SupabaseAuthService {
  /**
   * 邮箱密码登录
   */
  static async signInWithPassword(credentials: LoginCredentials): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    return { data, error };
  }

  /**
   * 邮箱注册
   */
  static async signUp(credentials: RegisterCredentials): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: credentials.user_metadata
      }
    });

    return { data, error };
  }

  /**
   * 邮箱验证码登录
   */
  static async signInWithOtp(email: string): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    return { data, error };
  }

  /**
   * 发送密码重置邮件
   */
  static async resetPassword(email: string): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    return { data, error };
  }

  /**
   * 更新密码
   */
  static async updatePassword(password: string): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    return { data, error };
  }

  /**
   * 获取当前用户
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  /**
   * 获取当前会话
   */
  static async getCurrentSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }

  /**
   * 刷新会话
   */
  static async refreshSession(): Promise<SupabaseAuthResponse> {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }

  /**
   * 登出
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * 获取用户配置文件
   */
  static async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  }

  /**
   * 更新用户配置文件
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }

  /**
   * 创建用户配置文件
   */
  static async createUserProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    return { data, error };
  }
}

/**
 * 转换 Supabase 用户为应用用户格式
 */
export function transformSupabaseUser(supabaseUser: User): Api.Auth.UserInfo {
  return {
    userId: supabaseUser.id,
    userName: supabaseUser.user_metadata?.name || supabaseUser.email || 'Unknown User',
    roles: supabaseUser.user_metadata?.roles || ['user'],
    buttons: supabaseUser.user_metadata?.buttons || []
  };
}

/**
 * 转换 Supabase 会话为应用 Token 格式
 */
export function transformSupabaseSession(session: Session): Api.Auth.LoginToken {
  return {
    token: session.access_token,
    refreshToken: session.refresh_token || undefined
  };
} 