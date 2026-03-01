<template>
  <div class="vod-page" :class="{ 'is-dark': isDark }">
    <Header />
    <!-- Hero Section (aligned with About page) -->
    <section class="header-section">
      <div class="container">
        <Motion 
          as="h1" 
          class="main-title"
          :initial="{ opacity: 0, y: 50 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }"
        >
          {{ $t('portal.nav.gallery') }}
        </Motion>
        <Motion 
          as="p" 
          class="main-description"
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2, duration: 0.8, ease: 'easeOut' }"
        >
          <span class="typewriter-text">{{ animatedDescription }}</span>
        </Motion>
      </div>
    </section>

    <section class="player-wrap">
      <div class="container">
        <div class="player-box">
          <video id="player-container-id" preload="auto" playsinline webkit-playsinline x5-playsinline controls :src="VIDEO_SRC" :poster="posterSrc"></video>
        </div>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </div>
    </section>
    <!-- 底部组件 -->
    <Footer />

  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Motion } from 'motion-v'
// @ts-ignore
import Footer from '../components/Footer.vue';

// @ts-ignore
import Header from '@/views/portal/components/Header.vue'
import posterSrc from '@/views/portal/assests/img/fm.png'
import { useAppStore } from '@/store/modules/app'
import { useThemeStore } from '@/store/modules/theme'
 
const errorMessage = ref('')
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.darkMode)
const VIDEO_SRC = 'https://1313402205.vod-qcloud.com/bf18547evodsh1313402205/c4d9e6a65145403697153612379/UFl6AL1u3TIA.mp4'

// i18n-aware hard-coded texts
const appStore = useAppStore()
const heroTextZh = '定格此刻，留存未来'
const heroTextEn = 'Capture this moment, preserve for the future.'
const heroText = ref(appStore.locale === 'zh-CN' ? heroTextZh : heroTextEn)
const animatedDescription = ref('')
let typewriterTimer: number | null = null

function startTypewriter(text: string) {
  if (!text) return
  animatedDescription.value = ''
  let index = 0
  if (typewriterTimer) {
    window.clearInterval(typewriterTimer)
    typewriterTimer = null
  }
  typewriterTimer = window.setInterval(() => {
    if (index < text.length) {
      animatedDescription.value += text.charAt(index)
      index++
    } else {
      if (typewriterTimer) {
        window.clearInterval(typewriterTimer)
        typewriterTimer = null
      }
      // 1秒后隐藏光标
      setTimeout(() => {
        const el = document.querySelector('.typewriter-text')
        if (el) el.classList.add('completed')
      }, 1000)
    }
  }, 45)
}

onMounted(() => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  
  startTypewriter(heroText.value)
})

onBeforeUnmount(() => {
  // 清理 resize 防抖与恢复根字号
  window.removeEventListener('resize', debouncedHandleResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = originalRootFontSize;
  }
  
  if (typewriterTimer) window.clearInterval(typewriterTimer)
  typewriterTimer = null
})

// listen to language changes
watch(
  () => appStore.locale,
  (val) => {
    heroText.value = val === 'zh-CN' ? heroTextZh : heroTextEn
    startTypewriter(heroText.value)
  }
)

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
    background: #c8bbf1;
    border-bottom: none;
}

.header.is-dark {
  background: #2a2040;
}
.vod-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.player-wrap {
  padding: 2rem;
}
/* Hero Section - align with About */
.header-section {
  background: #c8bbf1;
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
  margin-bottom: 2.5rem;
  line-height: normal;
  max-width: 53.5625rem;
}
.main-description {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  color: #000000;
  line-height: 2rem;
  max-width: 53.5625rem;
  margin: 0;
  font-weight: 400;
}
.typewriter-text { position: relative; }
.typewriter-text::after { content: '|'; color: #000; font-weight: bold; animation: blink 1s infinite; margin-left: 0.125rem; }
/* 当打字机完成后隐藏光标 */
.typewriter-text.completed::after { display: none; }
@keyframes blink { 0%, 50% { opacity: 1;} 51%, 100% { opacity: 0; } }
.container {
  width: 100%;
  max-width: 68.75rem;
  margin: 0 auto;
  padding: 0 1rem;
}
.player-box {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
#player-container-id {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.error {
  margin-top: 0.75rem;
  color: #e5484d;
}

/* ========== Dark Mode Styles ========== */
.vod-page.is-dark {
  background: #121212;
}

.vod-page.is-dark .header-section {
  background: #2a2040;
}

.vod-page.is-dark .main-title {
  color: #e0e0e0;
}

.vod-page.is-dark .main-description {
  color: #e0e0e0;
}

.vod-page.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.vod-page.is-dark .player-wrap {
  background: #121212;
}

.vod-page.is-dark .player-box {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* 响应式设计 */

/* 平板设备 */
@media (max-width: 768px) {
  .container { max-width: 95%; padding: 0 1rem; }
  .header-section { padding: 5rem 0 4.375rem; }
  .header-section .container { max-width: 100%; }
  .main-title { font-size: 36px; margin-bottom: 16px; }
  .main-description { font-size: 16px; }
  .player-wrap { padding: 1.25rem 0 2.5rem; }
}

/* 标准手机 */
@media (max-width: 480px) {
  .container { padding: 0 0.75rem; }
  .header-section { padding: 40px 0 60px; }
  .main-title { font-size: 28px; margin-bottom: 12px; }
  .main-description { font-size: 14px; }
  .player-wrap { padding: 1rem 0 2rem; }
}
</style>


