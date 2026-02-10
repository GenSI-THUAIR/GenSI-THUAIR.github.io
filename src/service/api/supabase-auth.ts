import { SupabaseAuthService, transformSupabaseUser, transformSupabaseSession } from '@/service/supabase-auth';
import type { LoginCredentials, RegisterCredentials } from '@/service/supabase-auth';

/**
 * Supabase 邮箱密码登录
 */
export function fetchSupabaseLogin(email: string, password: string) {
  return new Promise<{ data: Api.Auth.LoginToken; error: any }>(async (resolve) => {
    try {
      const { data, error } = await SupabaseAuthService.signInWithPassword({ email, password });
      
      if (error) {
        resolve({ data: {} as Api.Auth.LoginToken, error });
        return;
      }

      if (data.session) {
        const loginToken = transformSupabaseSession(data.session);
        resolve({ data: loginToken, error: null });
      } else {
        resolve({ data: {} as Api.Auth.LoginToken, error: new Error('No session data') });
      }
    } catch (error) {
      resolve({ data: {} as Api.Auth.LoginToken, error });
    }
  });
}

/**
 * Supabase 邮箱注册
 */
export function fetchSupabaseRegister(credentials: RegisterCredentials) {
  return new Promise<{ data: any; error: any }>(async (resolve) => {
    try {
      const { data, error } = await SupabaseAuthService.signUp(credentials);
      resolve({ data, error });
    } catch (error) {
      resolve({ data: null, error });
    }
  });
}

/**
 * Supabase 邮箱验证码登录
 */
export function fetchSupabaseOtpLogin(email: string) {
  return new Promise<{ data: any; error: any }>(async (resolve) => {
    try {
      const { data, error } = await SupabaseAuthService.signInWithOtp(email);
      resolve({ data, error });
    } catch (error) {
      resolve({ data: null, error });
    }
  });
}

/**
 * Supabase 密码重置
 */
export function fetchSupabaseResetPassword(email: string) {
  return new Promise<{ data: any; error: any }>(async (resolve) => {
    try {
      const { data, error } = await SupabaseAuthService.resetPassword(email);
      resolve({ data, error });
    } catch (error) {
      resolve({ data: null, error });
    }
  });
}

/**
 * Supabase 更新密码
 */
export function fetchSupabaseUpdatePassword(password: string) {
  return new Promise<{ data: any; error: any }>(async (resolve) => {
    try {
      const { data, error } = await SupabaseAuthService.updatePassword(password);
      resolve({ data, error });
    } catch (error) {
      resolve({ data: null, error });
    }
  });
}

/**
 * Supabase 获取用户信息
 */
export function fetchSupabaseGetUserInfo() {
  return new Promise<{ data: Api.Auth.UserInfo; error: any }>(async (resolve) => {
    try {
      const { user, error } = await SupabaseAuthService.getCurrentUser();
      
      if (error) {
        resolve({ data: {} as Api.Auth.UserInfo, error });
        return;
      }

      if (user) {
        const userInfo = transformSupabaseUser(user);
        resolve({ data: userInfo, error: null });
      } else {
        resolve({ data: {} as Api.Auth.UserInfo, error: new Error('No user data') });
      }
    } catch (error) {
      resolve({ data: {} as Api.Auth.UserInfo, error });
    }
  });
}

/**
 * Supabase 刷新 Token
 */
export function fetchSupabaseRefreshToken(refreshToken: string) {
  // Refresh token flow is disabled by requirement; return an error to avoid accidental use.
  return new Promise<{ data: Api.Auth.LoginToken; error: any }>((resolve) => {
    resolve({ data: {} as Api.Auth.LoginToken, error: new Error('Refresh token is disabled') });
  });
}

/**
 * Supabase 登出
 */
export function fetchSupabaseLogout() {
  return new Promise<{ data: any; error: any }>(async (resolve) => {
    try {
      const { error } = await SupabaseAuthService.signOut();
      resolve({ data: { success: true }, error });
    } catch (error) {
      resolve({ data: null, error });
    }
  });
} 