<template>
  <div class="posts-page" :class="{ 'is-dark': isDark }">
    <!-- 头部组件 -->
    <Header />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 顶部区域（对齐 About 的 hero 样式） -->
      <section class="header-section">
        <div class="container">
          <h1 class="main-title">{{ $t('portal.posts.postsFromGensi') }}</h1>
          
          <!-- 打字机效果描述 -->
          <p class="typewriter-text">{{ animatedDescription }}</p>
        </div>
      </section>

      <!-- 文章列表 -->
      <div class="posts-section">
        <div class="container">
          <!-- 两列布局容器 -->
          <div class="columns-container">
            <!-- 五分钟系列 -->
            <div v-if="fiveMinutePosts.length > 0" class="column-section">
              <div class="category-header">
                <h2 class="category-title">{{ $t('portal.blog.gensiFiveMinutes') }}</h2>
                <a class="read-all-link" @click="navTo('/portal/postdetail?type=根思五分钟系列')">{{ $t('portal.home.readAll') }}</a>
              </div>

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

            <!-- 深度系列 -->
            <div v-if="deepPosts.length > 0" class="column-section">
              <div class="category-header">
                <h2 class="category-title">{{ $t('portal.blog.gensiDepth') }}</h2>
                <a class="read-all-link" @click="navTo('/portal/postdetail?type=根思深度系列')">{{ $t('portal.home.readAll') }}</a>
              </div>
              
              <div class="posts-list">
                <article 
                  v-for="(post, index) in deepPosts" 
                  :key="`deep-${index}`"
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
import { ref , onMounted, onUnmounted, computed, watch } from 'vue';
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

// 打字机效果
const animatedDescription = ref('');
let typewriterTimer: NodeJS.Timeout | null = null;

// 本地化的描述文本（响应语言变化）
const localizedDescription = computed(() => {
  return $t('portal.posts.subtitle' as any);
});

// 打字机效果函数 
function startTypewriter(text: string) {
  if (!text) return;
  
  animatedDescription.value = '';
  let index = 0;
  
  // 清理之前的定时器
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
  }
  
  typewriterTimer = setInterval(() => {
    if (index < text.length) {
      animatedDescription.value += text.charAt(index);
      index++;
    } else {
      if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
      }
      // 1秒后隐藏光标
      setTimeout(() => {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (typewriterElement) {
          typewriterElement.classList.add('completed');
        }
      }, 1000);
    }
  }, 45); // 每45ms添加一个字符
}

// 根据当前语言获取博客标题的辅助函数
function getLocalizedBlogTitle(blog: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN 
    ? (blog.title_cn || blog.title) 
    : (blog.title || blog.title_cn);
}

// 文章数据
const posts = ref<any[]>([]);

// 分组数据
const fiveMinutePosts = ref<any[]>([]);
const deepPosts = ref<any[]>([]);

async function getPosts(){
  // 获取根思五分钟系列，限制2条
  const { data: fiveMinuteData, error: fiveMinuteError } = await supabase
    .from('blog')
    .select('*')
    .eq('type', '根思五分钟系列')
    .order('time', { ascending: false })
    .limit(2);
  
  if (fiveMinuteError) {
    console.error('Error fetching five minute posts:', fiveMinuteError);
  } else {
    fiveMinutePosts.value = fiveMinuteData || [];
  }

  // 获取根思深度系列，限制2条
  const { data: deepData, error: deepError } = await supabase
    .from('blog')
    .select('*')
    .eq('type', '根思深度系列')
    .order('time', { ascending: false })
    .limit(2);
  
  if (deepError) {
    console.error('Error fetching deep posts:', deepError);
  } else {
    deepPosts.value = deepData || [];
  }

  // 合并所有数据到posts中（如果需要的话）
  posts.value = [...fiveMinutePosts.value, ...deepPosts.value];
}

// 监听本地化描述的变化（含语言切换）
watch(localizedDescription, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      startTypewriter(newValue);
    }, 500);
  } else {
    animatedDescription.value = '';
  }
});

onMounted(() => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  
  // 启动打字机效果
  startTypewriter(localizedDescription.value);
  
  getPosts();
});

onUnmounted(() => {
  // 清理打字机timer
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  
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

function toNewTab(url: string){
  if(!url){
    return;
  }
  window.open(url, '_blank');
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


.read-all-link {
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: #000;
    text-decoration: underline;
    cursor: pointer;
  }
  .read-all-link:hover{
    color: #c0c0c0;
  }

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

.posts-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Sora', sans-serif;
}

.main-content {
  flex: 1;
}

/* 顶部英雄区域（与 About 对齐） */
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
  margin-bottom: 1.5rem;
  line-height: normal;
  max-width: 53.5625rem;
  font-family: 'Sora', sans-serif;
}

/* 打字机效果文本 */
.typewriter-text {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #000000;
  line-height: 1.8;
  max-width: 53.5625rem;
  margin-top: 1rem;
  position: relative;
}

.typewriter-text::after {
  content: '|';
  animation: blink 1s step-end infinite;
  margin-left: 2px;
}

.typewriter-text.completed::after {
  display: none;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* 文章列表区域 */
.posts-section {
  padding: 2.5rem 0;
}

/* 两列布局容器 */
.columns-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* 列区域样式 */
.column-section {
  background-color: #fff;
  border: 0.125rem solid #000;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: fit-content;
}

.column-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 分类头部 */
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 0.125rem solid #f0f0f0;
}

.category-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #000000;
  font-family: 'Sora', sans-serif;
  margin: 0;
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
  padding: 1.25rem 0;
  border-bottom: 0.0625rem solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.post-content {
  flex: 1;
  padding-right: 1rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  font-family: 'Sora', sans-serif;
  transition: color 0.3s ease;
}

.post-item:hover .post-title {
  color: #333;
}

.post-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.post-author {
  font-size: 0.8125rem;
  color: #666;
  font-weight: 500;
  font-family: 'Sora', sans-serif;
}

.post-date {
  font-size: 0.8125rem;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 400;
  font-family: 'Sora', sans-serif;
}

.post-action {
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 0.125rem solid #e8e8e8;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-item:hover .action-button {
  background-color: #000000;
  color: #d7ff39;
  border-color: #000000;
  transform: scale(1.05);
}



/* ========== Dark Mode Styles ========== */
.posts-page.is-dark {
  background: #121212;
}

.posts-page.is-dark .header-section {
  background: #1a2a35;
}

.posts-page.is-dark .main-title {
  color: #e0e0e0;
}

.posts-page.is-dark .typewriter-text {
  color: #e0e0e0;
}

.posts-page.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.posts-page.is-dark .posts-section {
  background: #121212;
}

.posts-page.is-dark .column-section {
  background-color: #222;
  border-color: #444;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.posts-page.is-dark .column-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.posts-page.is-dark .category-header {
  border-bottom-color: #333;
}

.posts-page.is-dark .category-title {
  color: #e0e0e0;
}

.posts-page.is-dark .read-all-link {
  color: #9ee8ff;
}

.posts-page.is-dark .read-all-link:hover {
  color: #7ecef4;
}

.posts-page.is-dark .post-item {
  border-bottom-color: #333;
}

.posts-page.is-dark .post-item:hover {
  background-color: #2a2a2a;
}

.posts-page.is-dark .post-title {
  color: #e0e0e0;
}

.posts-page.is-dark .post-item:hover .post-title {
  color: #9ee8ff;
}

.posts-page.is-dark .post-author {
  color: #999;
}

.posts-page.is-dark .post-date {
  color: #999;
}

.posts-page.is-dark .action-button {
  background-color: #2a2a2a;
  border-color: #444;
  color: #999;
}

.posts-page.is-dark .post-item:hover .action-button {
  background-color: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.posts-page.is-dark .empty-state {
  color: #999;
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
  
  .typewriter-text {
    font-size: 1rem;
    line-height: 1.6;
  }

  /* 移动端改为单列布局 */
  .columns-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .column-section {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }

  .column-section:hover {
    transform: none;
  }

  .category-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .empty-state {
    padding: 32px 0;
    font-size: 14px;
  }

  .posts-section { padding: 32px 0; }
  /* 让 posts 列表在移动端两侧留白更小，参考 news 页容器策略 */
  .posts-section .container { width: 95%; max-width: 95%; margin: 0 auto; padding: 0 16px; }

  .post-item {
    align-items: flex-start;
    gap: 12px;
    padding: 1rem 0.75rem;
    margin: 0;
    border-radius: 0.5rem;
  }

  .post-item:hover {
    transform: none;
    background-color: #f8f9fa;
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

  .post-author,
  .post-date {
    font-size: 14px;
  }

  .post-action {
    align-self: flex-end;
    padding-top: 0;
  }

  .action-button {
    width: 2.25rem;
    height: 2.25rem;
  }
}

/* 标准手机 */
@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }

  .header-section { padding: 80px 0 70px; }
  .main-title { font-size: 28px; line-height: 36px; margin-bottom: 12px; }
  
  .typewriter-text {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .columns-container {
    gap: 1rem;
  }

  .column-section {
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .category-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .category-title {
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 20px 0;
    font-size: 12px;
  }

  .posts-section {
    padding: 20px 0;
  }
  .posts-section .container { width: 98%; max-width: 98%; margin: 0 auto; padding: 0 12px; }

  .post-item {
    padding: 0.875rem 0.5rem;
    gap: 0.75rem;
    margin: 0;
  }

  .post-title {
    font-size: 15px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .post-meta {
    gap: 8px;
  }

  .post-author,
  .post-date {
    font-size: 11px;
  }

  .action-button {
    width: 2rem;
    height: 2rem;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .header-section { padding: 80px 0 70px; }
  .main-title { font-size: 36px; margin-bottom: 16px; }
  
  .typewriter-text {
    font-size: 1rem;
  }

  .posts-section {
    padding: 24px 0;
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

/* 高分辨率屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .action-button {
    border-width: 1px;
  }
}
</style>
