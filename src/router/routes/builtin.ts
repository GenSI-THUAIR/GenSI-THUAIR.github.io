import type { CustomRoute } from '@elegant-router/types';
import { layouts, views } from '../elegant/imports';
import { getRoutePath, transformElegantRoutesToVueRoutes } from '../elegant/transform';

export const ROOT_ROUTE: CustomRoute = {
  name: 'root',
  path: '/',
  redirect: '/portal_home', // 保持重定向到门户首页
  meta: {
    title: 'root',
    constant: true
  }
};

const NOT_FOUND_ROUTE: CustomRoute = {
  name: 'not-found',
  path: '/:pathMatch(.*)*',
  component: 'layout.blank$view.404',
  meta: {
    title: 'not-found',
    constant: true
  }
};

/** builtin routes, it must be constant and setup in vue-router */
function getBuiltinRoutes(): CustomRoute[] {
  const routes: CustomRoute[] = [NOT_FOUND_ROUTE];
  
  // Only add ROOT_ROUTE if VITE_ROUTE_HOME is not 'portal_home'
  // because portal_home route already handles the root path '/'
  if (import.meta.env.VITE_ROUTE_HOME !== 'portal_home') {
    routes.unshift(ROOT_ROUTE);
  }
  
  return routes;
}

/** create builtin vue routes */
export function createBuiltinVueRoutes() {
  return transformElegantRoutesToVueRoutes(getBuiltinRoutes(), layouts, views);
}
