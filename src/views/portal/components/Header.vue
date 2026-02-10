<template>
  <header class="header" ref="headerRef">
    <div class="container">
      <div class="logo" @click="navigateTo('/portal_home', $event)">
        <img src="../assests/home/logo.png" alt="GenSI Logo" class="logo-icon" />
      </div>
      <nav class="navigation">
        <a href="#" class="nav-link" @click="navigateTo('/portal/about', $event)">{{ $t('portal.nav.about') }}</a>
        <div class="nav-dropdown" @mouseenter="showResearchDropdown" @mouseleave="hideResearchDropdown">
          <a href="#" class="nav-link" :class="{ active: isResearchActive }"
            @click="navigateTo('/portal/research', $event)">
            {{ $t('portal.nav.research') }}
            <svg class="dropdown-arrow" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <div class="dropdown-menu" :class="{ active: researchDropdownVisible }">
            <a href="#" class="dropdown-item" :class="{ active: isResearchBlogActive }"
              @click="navigateTo('/portal/blog', $event)">
              <span>{{ $t('portal.nav.blog') }}</span>
            </a>
            <a href="#" class="dropdown-item" :class="{ active: isProjectActive }"
              @click="navigateTo('/portal/project', $event)">
              <span>{{ $t('portal.nav.project') }}</span>
            </a>
            <a href="#" class="dropdown-item" :class="{ active: isPublicationsActive }"
              @click="navigateTo('/portal/publications', $event)">
              <span>{{ $t('portal.nav.publications') }}</span>
            </a>

          </div>
        </div>
        <div class="nav-dropdown" @mouseenter="showDropdown" @mouseleave="hideDropdown">
          <a href="#" class="nav-link" :class="{ active: isMediaActive }" @click="navigateTo('/portal/news', $event)">
            {{ $t('portal.nav.media') }}
            <svg class="dropdown-arrow" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <div class="dropdown-menu" :class="{ active: dropdownVisible }">
            <a href="#" class="dropdown-item dropdown-item-news" :class="{ active: isNewsActive }"
              @click="navigateTo('/portal/news', $event)">
              <span>{{ $t('portal.nav.news') }}</span>
            </a>
            <a href="#" class="dropdown-item" :class="{ active: isMediaBlogActive }"
              @click="navigateTo('/portal/posts', $event)">
              <span>{{ $t('portal.nav.posts') }}</span>
            </a>
            <a href="#" class="dropdown-item" :class="{ active: isGalleryActive }"
              @click="navigateTo('/portal/gallery', $event)">
              <span>{{ $t('portal.nav.gallery') }}</span>
            </a>
          </div>
        </div>
        <a @click="toSia" class="nav-link">{{ $t('portal.nav.siaLab') }}</a>
        <a href="#" class="nav-link contact" @click="navigateTo('/portal/contact', $event)">{{ $t('portal.nav.contact')
          }}</a>
        <div class="lang-switch" @click="toggleLanguage">
          <span class="lang-current">{{ currentLangLabel }}</span>
          <span class="lang-separator">|</span>
          <span class="lang-other">{{ otherLangLabel }}</span>
        </div>
      </nav>
      <!-- 移动端汉堡菜单按钮 -->
      <button class="mobile-menu-btn" :class="{ active: mobileMenuActive }" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ active: mobileMenuActive }" :style="{ top: headerHeight + 'px' }">
      <nav class="mobile-navigation">
        <a href="#" class="mobile-nav-link" @click="navigateTo('/portal/about', $event); closeMobileMenu($event)">{{
          $t('portal.nav.about') }}</a>
        <div class="mobile-nav-dropdown">
          <a href="#" class="mobile-nav-link mobile-nav-with-arrow" :class="{ active: isResearchActive }"
            @click="navigateTo('/portal/research', $event); closeMobileMenu($event)">
            {{ $t('portal.nav.research') }}
            <svg class="mobile-dropdown-arrow" :class="{ active: researchMobileDropdownVisible }" viewBox="0 0 12 8"
              fill="none" @click.stop="toggleResearchMobileDropdown($event)">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <div class="mobile-dropdown-menu" :class="{ active: researchMobileDropdownVisible }">
            <a href="#" class="mobile-dropdown-item" :class="{ active: isResearchBlogActive }"
              @click="navigateTo('/portal/blog', $event); closeMobileMenu($event)">
              {{ $t('portal.nav.blog') }}
            </a>
            <a href="#" class="mobile-dropdown-item" :class="{ active: isProjectActive }"
              @click="navigateTo('/portal/project', $event); closeMobileMenu($event)">
              {{ $t('portal.nav.project') }}
            </a>
            <a href="#" class="mobile-dropdown-item" :class="{ active: isPublicationsActive }"
              @click="navigateTo('/portal/publications', $event); closeMobileMenu($event)">
              {{ $t('portal.nav.publications') }}
            </a>

          </div>
        </div>
        <div class="mobile-nav-dropdown">
          <a href="#" class="mobile-nav-link mobile-nav-with-arrow" :class="{ active: isMediaActive }"
            @click="navigateTo('/portal/news', $event); closeMobileMenu($event)">
            {{ $t('portal.nav.media') }}
            <svg class="mobile-dropdown-arrow" :class="{ active: mobileDropdownVisible }" viewBox="0 0 12 8" fill="none"
              @click.stop="toggleMobileDropdown($event)">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </a>
          <div class="mobile-dropdown-menu" :class="{ active: mobileDropdownVisible }">
            <a href="#" class="mobile-dropdown-item mobile-dropdown-item-news" :class="{ active: isNewsActive }"
              @click="navigateTo('/portal/news', $event); closeMobileMenu($event)">
              {{ $t('portal.nav.news') }}
            </a>
            <a href="#" class="mobile-dropdown-item" :class="{ active: isMediaBlogActive }"
              @click="navigateTo('/portal/posts', $event); closeMobileMenu($event)">
              {{ $t('portal.nav.posts') }}
            </a>
            <a href="#" class="mobile-dropdown-item" :class="{ active: isGalleryActive }"
              @click="navigateTo('/portal/gallery', $event); closeMobileMenu($event)">
              <span>{{ $t('portal.nav.gallery') }}</span>
            </a>
          </div>
        </div>
        <a class="mobile-nav-link" @click="closeMobileMenu($event, true)">{{ $t('portal.nav.siaLab') }}</a>
        <a href="#" class="mobile-nav-link contact"
          @click="navigateTo('/portal/contact', $event); closeMobileMenu($event)">{{ $t('portal.nav.contact') }}</a>
        <div class="mobile-lang-switch" @click="toggleLanguage">
          <span class="mobile-lang-current">{{ currentLangLabel }}</span>
          <span class="mobile-lang-separator">|</span>
          <span class="mobile-lang-other">{{ otherLangLabel }}</span>
        </div>
      </nav>
    </div>
    <!-- 移动端菜单遮罩 -->
    <div class="mobile-menu-overlay" :class="{ active: mobileMenuActive }" @click="closeMobileMenu"></div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

// 计算当前活跃的导航项
const isResearchActive = computed(() =>
  route.path === '/portal/research' ||
  route.path === '/portal/project' ||
  route.path === '/portal/publications' ||
  route.path === '/portal/blog'
);
const isProjectActive = computed(() => route.path === '/portal/project');
const isPublicationsActive = computed(() => route.path === '/portal/publications');
const isResearchBlogActive = computed(() => route.path === '/portal/blog');
const isMediaActive = computed(() => route.path === '/portal/news' || route.path === '/portal/posts');
const isNewsActive = computed(() => route.path === '/portal/news');
const isMediaBlogActive = computed(() => route.path === '/portal/posts');
const isGalleryActive = computed(() => route.path === '/portal/gallery');

// 语言切换相关
const currentLangLabel = computed(() => {
  return appStore.locale === 'zh-CN' ? '中文' : 'EN';
});

const otherLangLabel = computed(() => {
  return appStore.locale === 'zh-CN' ? 'EN' : '中文';
});

function toggleLanguage() {
  const newLang = appStore.locale === 'zh-CN' ? 'en-US' : 'zh-CN';
  appStore.changeLocale(newLang);
}

function toSia() {
  window.open('https://github.com/BytedTsinghua-SIA', '_blank');
}

function navigateTo(path: string, event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  router.push(path);
}

// 联系我们：直接跳转到单独的 Contact 页面

// 移动端菜单状态
const mobileMenuActive = ref(false);
// 研究领域下拉菜单状态
const researchDropdownVisible = ref(false);
// 媒体下拉菜单状态
const dropdownVisible = ref(false);
// 移动端研究领域下拉菜单状态
const researchMobileDropdownVisible = ref(false);
// 移动端媒体下拉菜单状态
const mobileDropdownVisible = ref(false);
// Header引用和高度
const headerRef = ref<HTMLElement | null>(null);
const headerHeight = ref(80);

// 切换移动端菜单
function toggleMobileMenu() {
  mobileMenuActive.value = !mobileMenuActive.value;
  // 控制body滚动
  if (mobileMenuActive.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

// 关闭移动端菜单
function closeMobileMenu(event?: Event, toSia?: boolean) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  mobileMenuActive.value = false;
  researchMobileDropdownVisible.value = false; // 关闭移动端菜单时也关闭研究领域下拉菜单
  mobileDropdownVisible.value = false; // 关闭移动端菜单时也关闭媒体下拉菜单
  document.body.style.overflow = ''; // 恢复body滚动
  if (toSia) {
    window.open('https://github.com/BytedTsinghua-SIA', '_blank');
  }
}

// 显示研究领域下拉菜单
function showResearchDropdown() {
  researchDropdownVisible.value = true;
}

// 隐藏研究领域下拉菜单
function hideResearchDropdown() {
  researchDropdownVisible.value = false;
}

// 显示媒体下拉菜单
function showDropdown() {
  dropdownVisible.value = true;
}

// 隐藏媒体下拉菜单
function hideDropdown() {
  dropdownVisible.value = false;
}

// 切换移动端研究领域下拉菜单
function toggleResearchMobileDropdown(event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  researchMobileDropdownVisible.value = !researchMobileDropdownVisible.value;
}

// 切换移动端媒体下拉菜单
function toggleMobileDropdown(event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  mobileDropdownVisible.value = !mobileDropdownVisible.value;
}

// 计算header高度
function calculateHeaderHeight() {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.offsetHeight;
  }
}

// 窗口resize时重新计算高度
function handleResize() {
  calculateHeaderHeight();
  // 如果在桌面端，关闭移动端菜单
  if (window.innerWidth > 768 && mobileMenuActive.value) {
    closeMobileMenu();
  }
}

onMounted(() => {
  calculateHeaderHeight();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 确保在组件销毁时恢复body滚动
  document.body.style.overflow = '';
});
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 10px 40px;
}

/* 顶部导航 */
.header {
  position: relative;
  padding: 20px 0;
  border-bottom: none;
  background: var(--portal-header-bg, #fff);
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
  height: 50px;
  width: auto;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  font-size: 20px;
  font-weight: 600;
  text-decoration: none;
  color: #000000;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #666666;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #000000;
  border-radius: 1px;
}

.nav-link.contact {
  font-weight: bold;
}

/* 语言切换样式 */
.lang-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  color: #000000;
  transition: color 0.3s ease;
  user-select: none;
}

.lang-switch:hover {
  color: #666666;
}

.lang-current {
  color: #000000;
  font-weight: bold;
}

.lang-separator {
  color: #cccccc;
  font-weight: normal;
}

.lang-other {
  color: #888888;
  font-weight: normal;
}

.lang-other:hover {
  color: #000000;
}

/* 下拉菜单样式 */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.nav-dropdown .nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dropdown-arrow {
  width: 12px;
  height: 8px;
  transition: transform 0.3s ease;
}

.nav-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 3px solid #000000;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 16px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-menu.active {
  opacity: 1;
  visibility: visible;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #000;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  padding-right: 40px;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 20px;
  width: 0;
  height: 2px;
  background-color: #000;
  transition: width 0.3s ease;
}

.dropdown-item::after {
  content: '';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #000;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dropdown-item:hover::before {
  width: calc(100% - 40px);
}

.dropdown-item:hover::after {
  opacity: 1;
}

.dropdown-item.active::before {
  width: calc(100% - 40px);
}

.dropdown-item.active::after {
  opacity: 1;
}

.dropdown-item-news {
  margin-bottom: 4px;
}

/* 移动端汉堡菜单 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  z-index: 1001;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #000;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-menu {
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 1000;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.mobile-menu.active {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

.mobile-navigation {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.mobile-nav-link {
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  color: #000;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.3s ease;
  position: relative;
}

.mobile-nav-link:hover {
  color: #666666;
}

.mobile-nav-link.active {
  border-bottom: 3px solid #000000;
}

.mobile-nav-link.contact {
  font-weight: bold;
  border-bottom: none;
}

/* 移动端语言切换样式 */
.mobile-lang-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: color 0.3s ease;
  user-select: none;
}

.mobile-lang-switch:hover {
  color: #666666;
}

.mobile-lang-current {
  color: #000000;
  font-weight: bold;
}

.mobile-lang-separator {
  color: #cccccc;
  font-weight: normal;
}

.mobile-lang-other {
  color: #888888;
  font-weight: normal;
}

.mobile-lang-other:hover {
  color: #000000;
}

/* 移动端下拉菜单样式 */
.mobile-nav-dropdown {
  display: flex;
  flex-direction: column;
}

.mobile-nav-with-arrow {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}

.mobile-dropdown-arrow {
  width: 12px;
  height: 8px;
  transition: transform 0.3s ease;
}

.mobile-dropdown-arrow.active {
  transform: rotate(180deg);
}

.mobile-dropdown-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 0 20px;
}

.mobile-dropdown-menu.active {
  max-height: 200px;
}

.mobile-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #000;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;
  padding-right: 36px;
}

.mobile-dropdown-item::before {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 16px;
  width: 0;
  height: 2px;
  background-color: #000;
  transition: width 0.3s ease;
}

.mobile-dropdown-item::after {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: #000;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-dropdown-item:hover::before {
  width: calc(100% - 42px);
}

.mobile-dropdown-item:hover::after {
  opacity: 1;
}

.mobile-dropdown-item.active::before {
  width: calc(100% - 42px);
}

.mobile-dropdown-item.active::after {
  opacity: 1;
}

.mobile-dropdown-item:last-child {
  border-bottom: none;
}

.mobile-dropdown-item-news {
  margin-bottom: 4px;
}

/* 移动端触摸优化 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.mobile-nav-link,
.nav-link {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 桌面端额外断点缩放 */
@media (max-width: 1600px) {
  .container {
    padding: 10px 30px;
  }

  .nav-link {
    font-size: 18px;
  }

  .lang-switch {
    font-size: 18px;
  }
}

@media (max-width: 1400px) {
  .container {
    padding: 10px 30px;
  }

  .nav-link {
    font-size: 16px;
  }

  .lang-switch {
    font-size: 16px;
  }
}

@media (max-width: 1024px) {
  .container {
    padding: 10px 20px;
  }
}

@media (max-width: 768px) {
  .navigation {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .mobile-menu-overlay {
    display: block;
  }

  .mobile-nav-link {
    min-height: 48px;
    display: flex;
    align-items: center;
  }

  .container {
    padding: 12px 16px;
  }

  .header {
    padding: 16px 0;
    min-height: 64px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px 12px;
  }

  .header {
    padding: 12px 0;
    min-height: 56px;
  }

  .logo-icon {
    height: 36px;
  }

  .mobile-navigation {
    padding: 15px;
  }

  .mobile-nav-link {
    font-size: 16px;
    padding: 12px 0;
  }
}
</style>