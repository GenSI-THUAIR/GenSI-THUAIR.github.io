import type { RouteMeta } from 'vue-router';
import ElegantVueRouter from '@elegant-router/vue/vite';
import type { RouteKey } from '@elegant-router/types';

export function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue'
    },
    customRoutes: {
      names: [
        'exception_403',
        'exception_404',
        'exception_500',
        'document_project',
        'document_project-link',
        'document_vue',
        'document_vite',
        'document_unocss',
        'document_naive',
        'document_pro-naive',
        'document_antd',
        'document_alova'
      ]
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName as RouteKey;

      if (key === 'login') {
        const modules: UnionKey.LoginModule[] = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat'];

        const moduleReg = modules.join('|');

        return `/login/:module(${moduleReg})?`;
      }

      // 门户路由的路径转换
      if (key === 'portal_home') {
        return '/portal_home';
      }
      if (key === 'portal_about') {
        return '/portal/about';
      }
      if (key === 'portal_services') {
        return '/portal/services';
      }
      if (key === 'portal_news') {
        return '/portal/news';
      }
      if (key === 'portal_contact') {
        return '/portal/contact';
      }

      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName as RouteKey;

      const constantRoutes: RouteKey[] = [
        'login', 
        '403', 
        '404', 
        '500',
        'portal_home',
        'portal_about',
        'portal_services',
        'portal_news',
        'portal_contact',
        'portal_article',
        'portal_posts',
        'portal_postdetail',
        'portal_research',
        'portal_publications'
      ];

      const meta: Partial<RouteMeta> = {
        title: key,
        i18nKey: `route.${key}` as App.I18n.I18nKey
      };

      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }

      // 为门户路由添加 hideInMenu 属性和禁用缓存
      if (key.startsWith('portal_')) {
        meta.hideInMenu = true;
        meta.keepAlive = false;  // 禁用portal路由的缓存
      }

      return meta;
    }
  });
}
