import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import {
  fetchSupabaseLogin,
  fetchSupabaseLogout,
  fetchSupabaseRegister,
  fetchSupabaseOtpLogin,
  fetchSupabaseResetPassword
} from '@/service/api/supabase-auth';
import { useRouterPush } from '@/hooks/common/router';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { SupabaseAuthService } from '@/service/supabase-auth';

export const useSupabaseAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  // 检查 Supabase 原生 token 来判断登录状态
  const getSupabaseToken = () => {
    try {
      const tokenKey = `sb-aafssknttedpznxoiorb-auth-token`;
      const tokenData = localStorage.getItem(tokenKey);
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        return parsed?.access_token || null;
      }
    } catch (error) {
      console.error('获取 Supabase token 失败:', error);
    }
    return null;
  };

  // 初始化时检查 localStorage 中的 token
  const isLoggedIn = ref(!!getSupabaseToken());

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: []
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login - 检查 Supabase 原生 token */
  const isLogin = computed(() => {
    // 实时检查 localStorage 中的 token
    const hasToken = !!getSupabaseToken();
    if (hasToken !== isLoggedIn.value) {
      isLoggedIn.value = hasToken;
    }
    return isLoggedIn.value;
  });

  /** Reset auth store */
  async function resetStore() {
    const authStore = useSupabaseAuthStore();

    // 清理 Supabase 会话
    try {
      await SupabaseAuthService.signOut();
    } catch (error) {
      console.error('登出失败:', error);
    }
    
    isLoggedIn.value = false;
    Object.assign(userInfo, {
      userId: '',
      userName: '',
      roles: [],
      buttons: []
    });

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /**
   * Supabase 邮箱密码登录
   */
  async function login(email: string, password: string, redirect = true) {
    startLoading();

    const { data: loginToken, error } = await fetchSupabaseLogin(email, password);

    if (!error) {
      // 登录成功后直接设置状态，不获取用户信息
      isLoggedIn.value = true;
      
      // 设置默认用户信息（可选）
      Object.assign(userInfo, {
        userId: 'user-' + Date.now(),
        userName: email.split('@')[0] || 'User',
        roles: ['user'],
        buttons: []
      });

        await redirectFromLogin(redirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
    } else {
      window.$message?.error(error.message || '登录失败');
      resetStore();
    }

    endLoading();
  }

  /**
   * Supabase 邮箱注册
   */
  async function register(email: string, password: string, userMetadata?: any) {
    startLoading();

    const { data, error } = await fetchSupabaseRegister({
      email,
      password,
      user_metadata: userMetadata
    });

    if (!error) {
      window.$message?.success('注册成功，请检查邮箱验证邮件');
    } else {
      window.$message?.error(error.message || '注册失败');
    }

    endLoading();
    return { data, error };
  }

  /**
   * Supabase 邮箱验证码登录
   */
  async function loginWithOtp(email: string) {
    startLoading();

    const { data, error } = await fetchSupabaseOtpLogin(email);

    if (!error) {
      window.$message?.success('验证码已发送到您的邮箱');
    } else {
      window.$message?.error(error.message || '发送验证码失败');
    }

    endLoading();
    return { data, error };
  }

  /**
   * Supabase 密码重置
   */
  async function resetPassword(email: string) {
    startLoading();

    const { data, error } = await fetchSupabaseResetPassword(email);

    if (!error) {
      window.$message?.success('密码重置邮件已发送到您的邮箱');
    } else {
      window.$message?.error(error.message || '发送重置邮件失败');
    }

    endLoading();
    return { data, error };
  }

  async function initUserInfo() {
    // 仅检查 localStorage 中的 token，不调用任何 API
    const hasToken = !!getSupabaseToken();
    isLoggedIn.value = hasToken;

    // 如果有 token，设置默认用户信息
    if (hasToken) {
      Object.assign(userInfo, {
        userId: 'user-default',
        userName: 'User',
        roles: ['user'],
        buttons: []
      });
    }
  }

  /**
   * 监听 Supabase 认证状态变化
   */
  function initAuthListener() {
    SupabaseAuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);

      if (event === 'SIGNED_IN' && session) {
        isLoggedIn.value = true;
        // 设置基本用户信息，不调用 API
        Object.assign(userInfo, {
          userId: session.user?.id || 'user-' + Date.now(),
          userName: session.user?.email?.split('@')[0] || 'User',
          roles: ['user'],
          buttons: []
        });
      } else if (event === 'SIGNED_OUT') {
        isLoggedIn.value = false;
        Object.assign(userInfo, {
          userId: '',
          userName: '',
          roles: [],
          buttons: []
        });
      }
    });
  }

  /**
   * Supabase 登出
   */
  async function logout() {
    const { error } = await fetchSupabaseLogout();

    if (!error) {
      resetStore();
      window.$message?.success('登出成功');
    } else {
      window.$message?.error(error.message || '登出失败');
    }
  }

  return {
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    register,
    loginWithOtp,
    resetPassword,
    logout,
    initUserInfo,
    initAuthListener
  };
}); 