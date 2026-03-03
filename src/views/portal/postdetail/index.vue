<template>
    <div class="posts-detail-page" :class="{ 'is-dark': isDark }">
      <!-- 头部组件 -->
      <Header />
      
      <!-- 主要内容区域 -->
      <main class="main-content">
        <!-- 顶部区域（对齐 About 的 hero 样式） -->
        <section class="header-section">
          <div class="container">
            <h1 class="main-title">{{ type === "根思五分钟系列" ? $t('portal.blog.gensiFiveMinutes') : $t('portal.blog.gensiDepth') }}</h1>
            <!-- 搜索框 -->
            <div class="search-container search-container--inline">
              <div class="search-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20.561 20.561L16.061 16.061M18.061 11.061C18.061 14.3747 15.3747 17.061 12.061 17.061C8.74728 17.061 6.06101 14.3747 6.06101 11.061C6.06101 7.74728 8.74728 5.06101 12.061 5.06101C15.3747 5.06101 18.061 7.74728 18.061 11.061Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <input 
                type="text" 
                :placeholder="$t('portal.blog.blogSearchPlaceholder')" 
                class="search-input"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
              />
            </div>
          </div>
        </section>
  
        <!-- 文章列表 -->
        <div class="posts-section">
          <div class="container">
            <!-- 五分钟系列 -->
            <div class="category-section">
              <div class="posts-list">
                <article 
                  v-for="(post, index) in fiveMinutePosts" 
                  :key="`five-${index}`"
                  class="post-item"
                  @click="openPost(post)"
                >
                  <div class="post-content">
                    <h3 class="post-title" @click="toNewTab(post.link_url)">{{ getLocalizedBlogTitle(post) }}</h3>
                    <div class="post-meta">
                      <span class="post-author">by {{ post.create_by }}</span>
                      <span class="post-date">{{ post.time }}</span>
                    </div>
                  </div>
                  <div class="post-action">
                    <button class="action-button" @click="toNewTab(post.link_url)">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </article>
              </div>
            </div>
            <!-- 如果没有文章显示提示 -->
            <div v-if="posts.length === 0" class="empty-state">
              <p>{{ $t('common.noData') }}</p>
            </div>
          </div>
        </div>
      </main>
  
      <!-- 底部组件 -->
      <Footer />
      
      <!-- 返回顶部按钮 -->
      <BackToTop />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref , onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  // @ts-ignore
  import Header from '../components/Header.vue';
  // @ts-ignore
  import Footer from '../components/Footer.vue';
  // @ts-ignore
  import BackToTop from '../components/BackToTop.vue';
  import supabase from '@/supabase/supabase';
  import { $t } from '@/locales';
  import { useAppStore } from '@/store/modules/app';
  import { useThemeStore } from '@/store/modules/theme';
  
  defineOptions({
    name: 'PortalPosts'
  });
  
  const router = useRouter();
  const appStore = useAppStore();
  const themeStore = useThemeStore();
  const isDark = computed(() => themeStore.darkMode);
  const type = ref('');
  // 搜索查询
  const searchQuery = ref('');

  // 根据当前语言获取博客标题的辅助函数
  function getLocalizedBlogTitle(blog: any) {
    const isZhCN = appStore.locale === 'zh-CN';
    return isZhCN 
      ? (blog.title_cn || blog.title) 
      : (blog.title || blog.title_cn);
  }

  onMounted(() => {
    // 初始化 rem 根字号并监听窗口变化
    if (typeof document !== 'undefined') {
      originalRootFontSize = document.documentElement.style.fontSize;
      updateRootRem();
    }
    window.addEventListener('resize', debouncedHandleResize);
    
    type.value = router.currentRoute.value.query.type as string;
    getPosts();
  });

  onUnmounted(() => {
    // 清理 resize 防抖与恢复根字号
    window.removeEventListener('resize', debouncedHandleResize);
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = originalRootFontSize;
    }
  });
  
  // 文章数据
  const posts = ref<any[]>([]);
  
  // 根据type分组的计算属性
  const fiveMinutePosts = computed(() => {
    return posts.value.filter(post => post.type === type.value);
  });
  
  async function getPosts(){
    const { data, error } = await supabase.from('blog').select('*').order('time', { ascending: false });
    console.log('data', data);
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      posts.value = data;
    }
  }
  

  
  function toNewTab(url: string){
    if(!url){
      return;
    }
    window.open(url, '_blank');
  }
  
  // 搜索处理
   async function handleSearch() {
      console.log('搜索:', searchQuery.value);
    const { data, error } = await supabase.from('blog').select('*').eq('type', type.value).or(`title.ilike.%${searchQuery.value}%,title_cn.ilike.%${searchQuery.value}%`).order('time', { ascending: false });
    console.log('data', data);
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      posts.value = data;
    }
  }
  
  // 打开文章
  function openPost(post: any) {
    console.log('打开文章:', post.title);
    // 这里可以实现跳转到文章详情页
  }
  
  function navTo(url: string){
    router.push(url);
  }

  // ===== Rem 基准缩放（PC 无级响应式，试点仅对本页生效）=====
  // 以 1700px 作为基准宽度、16px 作为基准根字号
  const remBaselineWidth = 1700;
  const remBaseFontPx = 16;
  // portal 路由有 0.87 的 zoom，此处不额外乘以/除以 zoom，
  // 因为基准视觉就是在该 zoom 下用户确认的 1700px 观感
  let originalRootFontSize = '' as string;

  function updateRootRem() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const width = window.innerWidth || remBaselineWidth;
    // 线性缩放，并做合理夹紧，避免超大或超小屏异常
    const scale = width / remBaselineWidth;
    const clampedScale = Math.min(1.6, Math.max(0.7, scale));
    const nextFont = remBaseFontPx * clampedScale;
    document.documentElement.style.fontSize = `${nextFont}px`;
  }

  // 防抖处理 resize
  let resizeTimeout: NodeJS.Timeout | null = null;
  function debouncedHandleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
      updateRootRem();
    }, 300);
  }
  </script>
  
  <style scoped>
  
  .header{
    border-bottom: none;
    background-color: #9ee8ff;
  }
  .header.is-dark {
    background: #1a2a35;
  }
  
  /* 全局样式 */
  .container {
    max-width: 65%;
    margin: 0 auto;
  }
  
  .posts-detail-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Sora', sans-serif;
  }
  
  .main-content {
    flex: 1;
  }
  
  /* 顶部英雄区域（与 About 对齐，保持 Posts 蓝色背景） */
  .header-section {
    background: #9ee8ff;
    padding: 5rem 0 4.375rem 0;
    text-align: left;
  }
  .header-section .container {
    max-width: 65%;
    margin: 0 auto;
    padding: 0 1.25rem;
  }
  .main-title {
    font-size: 2.5rem;
    font-weight: 600;
    color: #000000;
    text-align: left;
    margin-bottom: 2.5rem;
    line-height: normal;
    max-width: 53.5625rem;
    font-family: 'Sora', sans-serif;
  }
  
  /* 搜索区域 */
  .search-container { position: relative; }
  .search-container--inline { width: 22.625rem; }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #000000;
    z-index: 2;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3.125rem;
    border: none;
    border-bottom: 0.125rem solid #000000;
    background: transparent;
    font-size: 1.25rem;
    color: #000000;
    outline: none;
    opacity: 0.5;
    font-family: 'Sora', sans-serif;
  }

  .search-input::placeholder {
    color: rgba(0, 0, 0, 0.5);
    font-size: 1.25rem;
    line-height: 2rem;
    font-family: 'Sora', sans-serif;
  }

  .search-input:focus {
    border-bottom-color: #000000;
  }
  
  /* 文章列表区域 */
  .posts-section {
    padding: 2.5rem 0;
  }
  
  .category-section {
    margin-bottom: 2.5rem;
    background-color: #fff;
    border-radius: 0.5rem;
    padding: 0 1.5rem;
  }
  
  .category-section:last-child {
    margin-bottom: 0;
  }
  
  .category-title {
    font-size: 2.625rem;
    font-weight: 600;
    color: #000000;
    margin-bottom: 2.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 0.1875rem solid #9ee8ff;
    font-family: 'Sora', sans-serif;
  }
  
  .empty-state {
  text-align: center;
  padding: 2.5rem 0;
  color: rgba(0, 0, 0, 0.5);
  font-size: 1rem;
  font-family: 'Sora', sans-serif;
}
  
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  
  .post-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 0.0625rem solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}
  
  .post-item:last-child {
    border-bottom: none;
  }
  
  .post-content {
  flex: 1;
  padding-right: 1.5rem;
}
  
  .post-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  font-family: 'Sora', sans-serif;
}
  
  .post-meta {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}
  
  .post-author {
  font-size: 0.875rem;
  color: #000000;
  font-weight: 400;
  font-family: 'Sora', sans-serif;
}

.post-date {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 400;
  font-family: 'Sora', sans-serif;
}
  
  .post-action {
    flex-shrink: 0;
    padding-top: 0.5rem;
  }
  
  .action-button {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 0.125rem solid #e0e0e0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #000000;
}
  
  .post-item:hover .action-button {
    background-color: #000000;
    color: #d7ff39;
    border-color: #000000;
  }
  
  /* 响应式设计 */
  
  /* 平板设备 */
  @media (max-width: 768px) {
    .container {
      padding: 0 20px;
    }
    
    .header-section { padding: 80px 0 70px; }
    .header-section .container { max-width: 100%; }
    .main-title { font-size: 36px; margin-bottom: 16px; }
    .search-container--inline { width: 100%; max-width: 100%; margin: 0 auto; }

    .category-title {
      font-size: 22px;
      margin-bottom: 12px;
      padding-bottom: 8px;
    }

    .category-section {
      margin-bottom: 24px;
      padding: 16px;
    }

    .empty-state {
      padding: 32px 0;
      font-size: 14px;
    }
  
    .search-container { margin-bottom: 16px; }
    .search-input { font-size: 18px; padding: 12px 16px 12px 45px; }
    .search-input::placeholder { font-size: 18px; }
    .search-icon { width: 24px; height: 24px; left: 16px; }

    .posts-section { padding: 32px 0; }
    .posts-section .container { width: 95%; max-width: 95%; margin: 0 auto; padding: 0 16px; }
  
    .post-item {
      align-items: flex-start;
      gap: 16px;
      padding: 20px 0;
    }
  
    .post-content {
      padding-right: 0;
      width: 100%;
    }
  
    .post-title {
      font-size: 18px;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .post-meta {
      gap: 8px;
      align-items: flex-start;
    }

    .post-action {
      align-self: flex-end;
      padding-top: 0;
    }

    .action-button {
      width: 40px;
      height: 40px;
    }
  }
    
  /* 标准手机 */
  @media (max-width: 480px) {
    .container {
      padding: 0 12px;
    }

    .header-section { padding: 80px 0 70px; }
    .main-title { font-size: 28px; line-height: 36px; margin-bottom: 12px; }
  
    .category-title {
      font-size: 18px;
      margin-bottom: 8px;
      padding-bottom: 4px;
    }

    .category-section {
      margin-bottom: 18px;
    }

    .empty-state {
      padding: 20px 0;
      font-size: 12px;
    }
  
    .search-container { margin-bottom: 12px; }
    .search-input { font-size: 16px; padding: 10px 12px 10px 40px; }
    .search-input::placeholder { font-size: 16px; }
    .search-icon { width: 20px; height: 20px; left: 12px; }

    .posts-section { padding: 20px 0; }
    .posts-section .container { width: 98%; max-width: 98%; margin: 0 auto; padding: 0 12px; }
  
    .post-item {
      padding: 14px 0;
      gap: 10px;
    }
  
    .post-title { font-size: 15px; margin-bottom: 6px; line-height: 1.4; }

    .post-meta {
      gap: 8px;
    }

    .post-author,
    .post-date {
      font-size: 11px;
    }

    .action-button {
      width: 32px;
      height: 32px;
    }
  }
  
  /* 移动端优化 */
  @media (max-width: 768px) {
    /* 移动端触摸优化 */
    .post-item {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
  
    .action-button {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
  
    .search-input {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
  
    /* 移动端悬停效果调整 */
    .post-item:hover {
      background-color: transparent;
    }
  
    .post-item:active {
      background-color: #f8f9fa;
    }
  
    .post-item:hover .action-button {
      background-color: #ffffff;
      color: #000000;
      border-color: #e0e0e0;
    }
  
    .post-item:active .action-button {
      background-color: #000000;
      color: #d7ff39;
      border-color: #000000;
    }
  }

  /* ========== Dark Mode Styles ========== */
  .posts-detail-page.is-dark {
    background: #121212;
  }

  .posts-detail-page.is-dark .header-section {
    background: #1a2a35;
  }

  .posts-detail-page.is-dark .main-title {
    color: #e0e0e0;
  }

  .posts-detail-page.is-dark .search-input {
    color: #e0e0e0;
    border-bottom-color: #e0e0e0;
  }

  .posts-detail-page.is-dark .search-input::placeholder {
    color: rgba(224, 224, 224, 0.5);
  }

  .posts-detail-page.is-dark .search-icon svg path {
    stroke: #e0e0e0;
  }

  .posts-detail-page.is-dark .posts-section {
    background: #121212;
  }

  .posts-detail-page.is-dark .category-section {
    background-color: #1e1e1e;
  }

  .posts-detail-page.is-dark .category-title {
    color: #e0e0e0;
    border-bottom-color: #0d4a5e;
  }

  .posts-detail-page.is-dark .post-item {
    border-bottom-color: #444;
  }

  .posts-detail-page.is-dark .post-title {
    color: #e0e0e0;
  }

  .posts-detail-page.is-dark .post-author {
    color: #999;
  }

  .posts-detail-page.is-dark .post-date {
    color: #999;
  }

  .posts-detail-page.is-dark .action-button {
    background-color: #2a2a2a;
    border-color: #555;
    color: #e0e0e0;
  }

  .posts-detail-page.is-dark .post-item:hover .action-button {
    background-color: #e0e0e0;
    color: #1a1a1a;
    border-color: #e0e0e0;
  }

  .posts-detail-page.is-dark .empty-state {
    color: #999;
  }

  @media (max-width: 768px) {
    .posts-detail-page.is-dark .post-item:hover {
      background-color: transparent;
    }

    .posts-detail-page.is-dark .post-item:active {
      background-color: #1e1e1e;
    }

    .posts-detail-page.is-dark .post-item:hover .action-button {
      background-color: #2a2a2a;
      color: #e0e0e0;
      border-color: #555;
    }

    .posts-detail-page.is-dark .post-item:active .action-button {
      background-color: #e0e0e0;
      color: #1a1a1a;
      border-color: #e0e0e0;
    }
  }
  
  </style>
  