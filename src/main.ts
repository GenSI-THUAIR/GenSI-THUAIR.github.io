import { createApp } from 'vue';
import './plugins/assets';
import './style.css';
import {
  setupAppVersionNotification,
  setupDayjs,
  setupIconifyOffline,
  setupLoading,
  setupNProgress,
  setupProNaiveComponents
} from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import { useSupabaseAuthStore } from './store/modules/auth/supabase-auth';
import App from './App.vue';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  await setupRouter(app);

  setupProNaiveComponents(app);

  setupI18n(app);

  setupAppVersionNotification();

  // 初始化 Supabase 认证监听器和用户信息
  const authStore = useSupabaseAuthStore();
  authStore.initAuthListener();
  await authStore.initUserInfo(); // 恢复用户信息初始化，基于 localStorage token 检查

  app.mount('#app');
}

setupApp();
