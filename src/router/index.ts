import type { App } from 'vue';
import {
  type RouterHistory,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';
import { createBuiltinVueRoutes } from './routes/builtin';
import { createRouterGuard } from './guard';

const { VITE_ROUTER_HISTORY_MODE = 'history', VITE_BASE_URL } = import.meta.env;

const historyCreatorMap: Record<Env.RouterHistoryMode, (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

// 在生产环境下使用 hash 模式避免部署问题
const routerHistoryMode = import.meta.env.PROD ? 'hash' : VITE_ROUTER_HISTORY_MODE;

export const router = createRouter({
  history: historyCreatorMap[routerHistoryMode](VITE_BASE_URL),
  routes: createBuiltinVueRoutes(),
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置（如前进/后退），则恢复到该位置
    if (savedPosition) {
      return savedPosition;
    }
    // 若存在 hash，优先滚动到对应锚点
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    // 否则滚动到页面顶部
    return { top: 0 };
  }
});

/** Setup Vue Router */
export async function setupRouter(app: App) {
  app.use(router);
  
  // 添加路由错误处理
  router.onError((error, to) => {
    console.error('Router error:', error);
    console.error('Failed route:', to);
    
    // 停止 NProgress
    if (window.NProgress) {
      window.NProgress.done();
    }
    
    // 如果是动态导入失败，重定向到404页面
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Loading chunk')) {
      console.warn('Component loading failed, redirecting to 404');
      router.push('/404');
    }
  });
  
  createRouterGuard(router);
  await router.isReady();
}
