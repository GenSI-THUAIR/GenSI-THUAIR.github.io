import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { useSupabaseAuthStore } from '@/store/modules/auth/supabase-auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';
import { getRouteName } from '@/router/elegant/transform';

// 防止重复刷新的标记和防抖机制
let isReloading = false;
const DEBOUNCE_TIME = 300000 * 1000; // 120秒防抖

// 检查是否在防抖期内
function isInDebounceTime(): boolean {
  const lastReloadTime = localStorage.getItem('lastPageReload');
  if (!lastReloadTime) return false;
  
  const now = Date.now();
  const timeDiff = now - parseInt(lastReloadTime);
  
  return timeDiff < DEBOUNCE_TIME;
}

// 记录刷新时间
function recordReloadTime(): void {
  localStorage.setItem('lastPageReload', Date.now().toString());
}

/**
 * create route guard
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    try {
      const location = await initRoute(to);
      
      if (location) {
        next(location);
        return;
      }
    } catch (error) {
      console.error('Route initialization failed:', error);
      // 如果路由初始化失败，继续正常的路由逻辑，避免阻塞
    }

    // 如果显式关闭鉴权，则直接放行所有路由
    const authDisabled = String(import.meta.env.VITE_ENABLE_AUTH || '').toLowerCase();
    if (authDisabled === 'false' || authDisabled === '0') {
      handleRouteSwitch(to, from, next);
      return;
    }

    const authStore = useSupabaseAuthStore();

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const noAuthorizationRoute: RouteKey = '403';

    // 使用缓存的登录状态，避免 API 调用
    const isLogin = authStore.isLogin;
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];

    const hasRole = authStore.userInfo.roles.some(role => routeRoles.includes(role));
    const hasAuth = authStore.isStaticSuper || !routeRoles.length || hasRole;

    // if it is login route when logged in, then switch to the news management page
    if (to.name === loginRoute && isLogin) {
      next({ name: 'news-manage' });
      return;
    }

    // if the route does not need login, then it is allowed to access directly
    if (!needLogin) {
      handleRouteSwitch(to, from, next);
      return;
    }

    // the route need login but the user is not logged in, then switch to the login page
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } });
      return;
    }

    // if the user is logged in but does not have authorization, then switch to the 403 page
    if (!hasAuth) {
      next({ name: noAuthorizationRoute });
      return;
    }

    // switch route normally
    handleRouteSwitch(to, from, next);
  });
}

/**
 * initialize route
 *
 * @param to to route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();

  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // if the constant route is not initialized, then initialize the constant route
  if (!routeStore.isInitConstantRoute) {
    try {
      await routeStore.initConstantRoute();
    } catch (error) {
      console.error('Failed to initialize constant routes:', error);
      // 如果常量路由初始化失败，继续执行，避免阻塞路由
    }

    // the route is captured by the "not-found" route because the constant route is not initialized
    // after the constant route is initialized, redirect to the original route
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  // 使用缓存的认证状态，避免 API 调用
  const authStore = useSupabaseAuthStore();
  const isLogin = authStore.isLogin;

  if (!isLogin) {
    // if the user is not logged in and the route is a constant route but not the "not-found" route, then it is allowed to access.
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();

      return null;
    }

    // if the user is not logged in, then switch to the login page
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };

    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // initialize the auth route
    try {
      await routeStore.initAuthRoute();
    } catch (error) {
      console.error('Failed to initialize auth routes:', error);
      // 如果认证路由初始化失败，继续执行，避免阻塞路由
    }

    // the route is captured by the "not-found" route because the auth route is not initialized
    // after the auth route is initialized, redirect to the original route
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // the auth route is initialized
  // it is not the "not-found" route, then it is allowed to access
  if (!isNotFoundRoute) {
    return null;
  }

  // it is captured by the "not-found" route, then check whether the route exists
  try {
    const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
    const noPermissionRoute: RouteKey = '403';

    if (exist) {
      const location: RouteLocationRaw = {
        name: noPermissionRoute
      };

      return location;
    }
  } catch (error) {
    console.error('Failed to check if auth route exists:', error);
    // 如果检查路由存在性失败，返回null继续正常流程
  }

  return null;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');

    next({ path: from.fullPath, replace: true, query: from.query, hash: to.hash });

    return;
  }

  // 先正常完成路由切换
  next();

  // 检查是否需要在路由完成后刷新页面
  const excludeRoutes = ['login', '403', '404', '500', 'iframe-page', 'gensiblog-preview'];
  const authStore = useSupabaseAuthStore();
  const isLogin = authStore.isLogin;

  const fromName = String(from.name ?? '');
  const toName = String(to.name ?? '');
  const isConstantRoute = !!to.meta.constant || !!from.meta.constant;
  const isPortalRoute = toName.startsWith('portal_') || fromName.startsWith('portal_');

  const needsRefresh = isLogin &&
                      !excludeRoutes.includes(toName) &&
                      !excludeRoutes.includes(fromName) &&
                      !isConstantRoute &&
                      !isPortalRoute;

  // 如果是路由切换（不是首次加载）且需要刷新
  if (needsRefresh && from.name && from.name !== to.name && !isReloading) {
    // 检查防抖时间
    if (isInDebounceTime()) {
      return;
    }

    isReloading = true;
    recordReloadTime();

    setTimeout(() => {
      if (window.location.hash.includes(to.path)) {
        window.location.reload();
      } else {
        isReloading = false;
      }
    }, 500);
  }
}

function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
