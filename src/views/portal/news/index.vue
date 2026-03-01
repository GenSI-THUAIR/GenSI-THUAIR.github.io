<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
// @ts-ignore
import Header from '../components/Header.vue';
// @ts-ignore
import Footer from '../components/Footer.vue';
// @ts-ignore
import BackToTop from '../components/BackToTop.vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

import supabase from '@/supabase/supabase';

defineOptions({
  name: 'PortalNews'
});

const router = useRouter();
const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// 搜索关键词
const searchKeyword = ref('');

// 根据当前语言获取新闻标题的辅助函数
function getLocalizedNewsTitle(news: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (news.title_cn || news.title)
    : (news.title || news.title_cn);
}

// 根据当前语言获取新闻内容的辅助函数
function getLocalizedNewsContent(news: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (news.content_cn || news.content)
    : (news.content || news.content_cn);
}

// 新闻数据
const newsData = ref<any[]>([]);
const tmpData = ref<any[]>([]);

// Image Preview State
const imagePreview = ref({
  show: false,
  src: '',
  title: ''
});

// 解析日期字符串为Date对象，用于排序
function parseNewsDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  // 处理 "Oct 2024" 格式
  const parts = dateStr.trim().split(' ');
  if (parts.length === 2) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = monthNames.indexOf(parts[0]);
    const year = parseInt(parts[1]);

    if (monthIndex !== -1 && !isNaN(year)) {
      return new Date(year, monthIndex);
    }
  }

  // 尝试其他日期格式
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// 排序新闻数据：空值和新日期在前
function sortNewsByTime(newsArray: any[]): any[] {
  return newsArray.sort((a, b) => {
    const dateA = parseNewsDate(a.time);
    const dateB = parseNewsDate(b.time);

    // 空值排在前面
    if (!dateA && !dateB) return 0;
    if (!dateA) return -1;
    if (!dateB) return 1;

    // 新日期排在前面（降序）
    return dateB.getTime() - dateA.getTime();
  });
}

async function getNews() {
  const { data, error } = await supabase.from('news').select('*');
  console.log(data);
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  // 对数据进行排序
  const sortedData = sortNewsByTime(data || []);
  return sortedData;
}

// 处理搜索
function handleSearch() {
  // 这里可以添加实际的搜索逻辑
  console.log('Searching for:', searchKeyword.value);

  //这样空串怎么版
  if (searchKeyword.value.trim()) {
    const filteredData = tmpData.value.filter((news) =>
      news.content.includes(searchKeyword.value) ||
      (news.content_cn && news.content_cn.includes(searchKeyword.value)) ||
      news.title.includes(searchKeyword.value) ||
      (news.title_cn && news.title_cn.includes(searchKeyword.value))
    );
    newsData.value = sortNewsByTime(filteredData);
  } else {
    newsData.value = tmpData.value;
  }
}

// 处理回车键搜索
function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

function navTo(url: string) {
  router.push(url);
}

function toNewTab(url: string) {
  window.open(url, '_blank');
}

// Image preview functions
const openImagePreview = (src: string, title: string) => {
  imagePreview.value.src = src;
  imagePreview.value.title = title;
  imagePreview.value.show = true;
};

const closeImagePreview = () => {
  imagePreview.value.show = false;
};

// ESC key handler for image preview
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && imagePreview.value.show) {
    closeImagePreview()
  }
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

onMounted(async () => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);

  const news = await getNews();
  newsData.value = news;
  tmpData.value = news;

  // Add ESC key listener for image preview
  document.addEventListener('keydown', handleEscKey);

  // 切回标签页或窗口获得焦点时刷新新闻
  const refreshNews = async () => {
    try {
      const latest = await getNews();
      newsData.value = latest;
      tmpData.value = latest;
      handleSearch();
    } catch (err) {
      console.error('Failed to refresh news after visibility/focus:', err);
    }
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') refreshNews();
  };
  const handleWindowFocus = () => refreshNews();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('pageshow', handleWindowFocus);

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange as any);
    window.removeEventListener('focus', handleWindowFocus as any);
    window.removeEventListener('pageshow', handleWindowFocus as any);
  });
});

onUnmounted(() => {
  // Remove ESC key listener
  document.removeEventListener('keydown', handleEscKey);

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
</script>

<template>
  <div class="news-page" :class="{ 'is-dark': isDark }">
    <Header />
    <!-- Hero Section (aligned with About page) -->
    <section class="header-section">
      <div class="container">
        <h1 class="main-title">{{ $t('portal.news.newsFromGensi') }}</h1>
        <div class="search-container search-container--inline">
          <div class="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.561 20.561L16.061 16.061M18.061 11.061C18.061 14.3747 15.3747 17.061 12.061 17.061C8.74728 17.061 6.06101 14.3747 6.06101 11.061C6.06101 7.74728 8.74728 5.06101 12.061 5.06101C15.3747 5.06101 18.061 7.74728 18.061 11.061Z"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <input type="text" v-model="searchKeyword" :placeholder="$t('portal.news.newsSearchPlaceholder')"
            class="search-input" @keypress="handleKeyPress" />
        </div>
      </div>
    </section>

    <!-- News Cards Section -->
    <div class="news-section">
      <div class="news-container">
        <!-- News Cards List -->
        <div class="news-list">
          <div v-for="news in newsData" :key="news.id" class="news-card horizontal-card">
            <div class="news-content">
              <h2 class="news-title" v-html="getLocalizedNewsTitle(news)"></h2>
              <div class="news-description" v-html="getLocalizedNewsContent(news)"></div>
              <div class="news-footer">
                <button class="btn btn-news" @click="toNewTab(news.news_link)">
                  {{ $t('portal.home.readMore') }}
                  <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
                <span class="news-date">{{ news.time }}</span>
              </div>
            </div>
            <div v-if="news.cover" class="news-image" @click="openImagePreview(news.cover, news.content)">
              <img :src="news.cover" :alt="`News ${news.id}`" />
              <div class="image-overlay">
                <svg class="preview-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                </svg>
                <span>{{ $t('portal.home.clickToPreview') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />

    <!-- 返回顶部按钮 -->
    <BackToTop />

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="imagePreview.show" class="image-preview-modal" @click="closeImagePreview">
        <div class="image-preview-container">
          <div class="image-preview-header">
            <button class="close-btn" @click="closeImagePreview">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="image-preview-content" @click.stop>
            <img :src="imagePreview.src" :alt="imagePreview.title" class="preview-image" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.header {
  border-bottom: none;
  background-color: #d7ff39;
}

.header.is-dark {
  background: #2a3a10;
}
.news-page {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Sora', sans-serif;
}

/* Hero Section - align with About */
.header-section {
  background: #d7ff39;
  padding: 5rem 0 4.375rem 0;
  text-align: left;
}

.header-section .container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.main-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: #000000;
  margin: 0 0 2.5rem 0;
  line-height: normal;
  max-width: 53.5625rem;
}

.search-container--inline {
  width: 22.625rem;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3.25rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #000000;
  background: transparent;
  border: none;
  border-bottom: 0.125rem solid #000000;
  outline: none;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.25rem;
  line-height: 2rem;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

/* News Section */
.news-section {
  background: #f5f5f5;
  padding: 4rem 0;
  position: relative;
}

.news-container {
  position: relative;
  width: 65%;
  max-width: 65%;
  margin: 0 auto;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin: 0 auto;
}

.news-card {
  background: #ffffff;
  border: 0.125rem solid #000000;
  border-radius: 1.5rem;
  padding: 2rem 3rem;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.news-card.horizontal-card {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: start;
  border: 0.15rem solid #000;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.news-card.horizontal-card:hover {
  border: 0.15rem solid #000;
  transform: translateY(-0.2rem) translateX(-0.1rem);
  box-shadow: 0.3rem 0.3rem 0 0 rgba(0, 0, 0, 1);
  background: linear-gradient(135deg, #e8ff7a 0%, #d2f152 50%, #d7ff39 100%);
  transition: all 1s ease;
}

.news-card.horizontal-card>* {
  position: relative;
  z-index: 1;
}

.news-image {
  border-radius: 1rem;
  overflow: hidden;
  height: 13rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 0.5rem;
  margin: auto 0;
  cursor: pointer;
  position: relative;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.news-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.news-image:hover .image-overlay {
  opacity: 1;
  pointer-events: auto;
}

.preview-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.image-overlay span {
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.news-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  line-height: 1.4;
  margin-bottom: 1.25rem;
}

.news-description {
  font-family: 'Sora', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #000000;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.btn-news {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: auto;
  border: 2px solid #000;
  position: relative;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-news::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
  top: -10px;
  right: -10px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
  border: 1px solid #000;
}

.btn-news:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  color: #c4e033;
}

.btn-news:hover::after {
  opacity: 1;
  transform: scale(1);
}

.btn-news:hover .arrow-icon {
  transform: rotate(0deg);
  stroke: #c4e033;
}

.btn-news:active {
  transform: translateY(-1px);
  transition: transform 0.1s ease;
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.3s ease;
}

.news-date {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #000000;
  opacity: 0.8;
}

/* Newsletter Section */
.newsletter {
  padding: 5rem 0;
  background: linear-gradient(135deg, #d7ff39 0%, #7bd8f4 100%);
}

.newsletter-content {
  text-align: center;
  max-width: 37.5rem;
  margin: 0 auto;
}

.newsletter-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 3rem;
  color: #000000;
  margin-bottom: 1.25rem;
}

.newsletter-description {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #000000;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  max-width: 25rem;
  margin: 0 auto;
}

.newsletter-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 0.125rem solid #ffffff;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-family: 'Sora', sans-serif;
}

.newsletter-input:focus {
  outline: none;
  border-color: #000000;
}

.newsletter-btn {
  padding: 1rem 2rem;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.newsletter-btn:hover {
  background: #333333;
}

/* Image Preview Modal */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.image-preview-container {
  width: 90%;
  max-width: 75rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scale(0.9) translateY(-1.25rem);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.image-preview-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #d7ff39;
  border-bottom: 0.0625rem solid #e0e0e0;
}

.image-preview-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: #000000;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #000000;
}

.image-preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  max-height: calc(90vh - 5rem);
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
}

/* ========== Dark Mode Styles ========== */
.news-page.is-dark {
  background: #121212;
}

.news-page.is-dark .header-section {
  background: #2a3a10;
}

.news-page.is-dark .main-title {
  color: #e0e0e0;
}

.news-page.is-dark .search-container {
  color: #e0e0e0;
}

.news-page.is-dark .search-input {
  color: #e0e0e0;
  border-bottom-color: #e0e0e0;
}

.news-page.is-dark .search-input::placeholder {
  color: rgba(224, 224, 224, 0.5);
}

.news-page.is-dark .news-section {
  background: #1a1a1a;
}

.news-page.is-dark .news-card {
  background: #222;
  border-color: #444;
}

.news-page.is-dark .news-card.horizontal-card:hover {
  border-color: #666;
  box-shadow: 0.3rem 0.3rem 0 0 rgba(215, 255, 57, 0.3);
  background: linear-gradient(135deg, #2a3a10 0%, #3a4a15 50%, #4a5a1a 100%);
}

.news-page.is-dark .news-title,
.news-page.is-dark .news-title :deep(*) {
  color: #e0e0e0 !important;
}

.news-page.is-dark .news-description,
.news-page.is-dark .news-description :deep(*) {
  color: #ccc !important;
}

.news-page.is-dark .news-date {
  color: #999;
}

.news-page.is-dark .news-image {
  background: #2a2a2a;
}

.news-page.is-dark .btn-news {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.news-page.is-dark .btn-news::after {
  background: #e0e0e0;
  border-color: #e0e0e0;
}

.news-page.is-dark .btn-news:hover {
  background: #d7ff39;
  color: #1a1a1a;
  box-shadow: 0 6px 20px rgba(215, 255, 57, 0.3);
}

.news-page.is-dark .image-preview-container {
  background: #2a2a2a;
}

.news-page.is-dark .image-preview-header {
  background: #333;
  border-bottom-color: #444;
}

.news-page.is-dark .close-btn:hover {
  background: #444;
}

.news-page.is-dark .close-btn svg {
  color: #ccc;
}

/* Responsive Design */

@media (max-width: 768px) {
  .header-section .container {
    max-width: 100%;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
  }

  .main-title {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .search-container--inline {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .search-input {
    font-size: 18px;
    padding: 12px 16px 12px 48px;
  }

  .search-input::placeholder {
    font-size: 18px;
  }

  .news-section {
    padding: 60px 0;
  }

  .news-container {
    width: 95%;
    max-width: 95%;
    margin: 0 auto;
    padding: 0 16px;
  }

  .news-list {
    gap: 20px;
  }

  .news-card.horizontal-card {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    padding: 24px;
    background: #fff;
    border: 2px solid #000;
    transform: none;
    box-shadow: none;
  }

  .news-content {
    display: flex !important;
    flex-direction: column !important;
    order: 2;
  }

  .news-footer {
    order: 4 !important;
  }

  .news-title {
    font-size: 20px;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .news-description {
    font-size: 18px !important;
    line-height: 1.57 !important;
    margin-bottom: 16px !important;
    color: #000 !important;
    order: 1 !important;
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .news-image {
    order: 1 !important;
    width: 100% !important;
    max-width: 380px !important;
    height: 180px !important;
    margin: 0 auto !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    background: #fff !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }

  .news-image img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .news-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    margin-top: 16px !important;
  }

  .btn-news {
    padding: 8px 16px !important;
    font-size: 14px !important;
    background: #000 !important;
    color: #fff !important;
    border-radius: 8px !important;
    align-self: flex-start !important;
    border: none;
    flex-shrink: 0 !important;
  }

  .news-date {
    font-size: 14px;
    flex-shrink: 0 !important;
  }

  /* Mobile image preview adjustments */
  .image-preview-container {
    max-width: 95%;
    max-height: 95vh;
    margin: 0 10px;
  }

  .image-preview-header {
    padding: 16px 20px;
  }

  .image-preview-title {
    font-size: 18px;
  }

  .image-preview-content {
    padding: 16px;
    max-height: calc(95vh - 70px);
  }

  .preview-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 8px;
  }

  .image-overlay span {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 28px;
    line-height: 36px;
    margin-bottom: 12px;
  }

  .search-input {
    font-size: 16px;
    padding: 10px 12px 10px 40px;
  }

  .search-input::placeholder {
    font-size: 16px;
  }

  .search-icon {
    left: 12px;
    width: 20px;
    height: 20px;
  }

  .news-section {
    padding: 40px 0;
  }

  .news-container {
    width: 98%;
    max-width: 98%;
    margin: 0 auto;
    padding: 0 12px;
  }

  .news-list {
    gap: 16px;
  }

  .news-card.horizontal-card {
    padding: 16px;
    border-radius: 16px;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .news-footer {
    order: 4 !important;
  }

  .news-title {
    font-size: 16px;
    line-height: 1.3;
    margin-bottom: 8px;
  }

  .news-description {
    font-size: 16px !important;
    line-height: 1.4 !important;
    margin-bottom: 10px !important;
  }

  .news-image {
    height: 140px !important;
    margin-bottom: 12px !important;
    border-radius: 12px !important;
  }

  .news-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
    margin-top: 12px !important;
  }

  .btn-news {
    padding: 6px 14px !important;
    font-size: 12px !important;
    flex-shrink: 0 !important;
  }

  .news-date {
    font-size: 12px;
    flex-shrink: 0 !important;
  }

  /* Small screen image preview adjustments */
  .image-preview-container {
    max-width: 98%;
    max-height: 98vh;
    margin: 0 4px;
    border-radius: 8px;
  }

  .image-preview-header {
    padding: 12px 16px;
  }

  .image-preview-title {
    font-size: 16px;
  }

  .image-preview-content {
    padding: 12px;
    max-height: calc(98vh - 60px);
  }

  .close-btn {
    padding: 6px;
  }

  .close-btn svg {
    width: 18px;
    height: 18px;
  }

  .preview-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 6px;
  }

  .image-overlay span {
    font-size: 12px;
  }
}
</style>