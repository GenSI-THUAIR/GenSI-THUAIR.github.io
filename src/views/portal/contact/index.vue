<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted, watch } from 'vue';
import { useMessage } from 'naive-ui';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
const Header = defineAsyncComponent(() => import('../components/Header.vue'));
const Footer = defineAsyncComponent(() => import('../components/Footer.vue'));
const BackToTop = defineAsyncComponent(() => import('../components/BackToTop.vue'));
import supabase from '@/supabase/supabase';
import { useSeo } from '@/composables/useSeo';

defineOptions({
  name: 'PortalContact'
});

useSeo({
  title: 'Contact',
  description: 'Get in touch with GenSI Lab. Contact information and collaboration inquiries.',
  keywords: 'GenSI, contact, collaboration, inquiry',
});

const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// 表单数据（复用 About 页 Contact Section 逻辑）
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  message: ''
});

const MAX_MESSAGE_LENGTH = 500;

const messageProgress = computed(() => {
  const currentLength = formData.value.message.length;
  const percentage = (currentLength / MAX_MESSAGE_LENGTH) * 100;
  return {
    currentLength,
    maxLength: MAX_MESSAGE_LENGTH,
    percentage: Math.min(percentage, 100),
    isOverLimit: currentLength > MAX_MESSAGE_LENGTH
  };
});

const message = useMessage();

const submitForm = async () => {
  if (!formData.value.firstName || !formData.value.lastName || !formData.value.email || !formData.value.message) {
    message.error('Please fill in all fields');
    return;
  }
  if (!formData.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    message.error('Please enter a valid email address');
    return;
  }
  if (formData.value.message.length > MAX_MESSAGE_LENGTH) {
    message.error('Message is too long');
    return;
  }
  const { error } = await supabase.from('message').insert({
    first_name: formData.value.firstName,
    last_name: formData.value.lastName,
    email_address: formData.value.email,
    message: formData.value.message
  });
  if (error) {
    message.error('Error submitting form');
  } else {
    formData.value = { firstName: '', lastName: '', email: '', message: '' };
    message.success('Message submitted successfully, we will contact you soon.');
  }
};

// Typewriter effect for main-description
const animatedDescription = ref('');
let typewriterTimer: NodeJS.Timeout | null = null;
function startTypewriter(text: string) {
  if (!text) return;
  animatedDescription.value = '';
  let index = 0;
  if (typewriterTimer) clearInterval(typewriterTimer);
  typewriterTimer = setInterval(() => {
    if (index < text.length) {
      animatedDescription.value += text.charAt(index);
      index++;
    } else {
      if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
      }
      setTimeout(() => {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (typewriterElement) {
          typewriterElement.classList.add('completed');
        }
      }, 800);
    }
  }, 45);
}

onMounted(() => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  
  startTypewriter(localizedContactDescription.value);
});

onUnmounted(() => {
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

// Localized description text (EN/ZN) with typewriter
const localizedContactDescription = computed(() => {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN ? '欢迎随时与我们联系 ~' : 'Feel free to contact us ~';
});

watch(localizedContactDescription, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      startTypewriter(newValue);
    }, 500);
  } else {
    animatedDescription.value = '';
  }
});

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
  
  // 只在768px以上的设备应用rem缩放，移动端保持默认16px
  if (width <= 768) {
    document.documentElement.style.fontSize = '16px';
    return;
  }
  
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

<template>
  <div class="contact-page" :class="{ 'is-dark': isDark }">
    <Header />

    <!-- Header Section -->
    <section class="header-section">
      <div class="container">
        <h1 class="main-title">{{ $t('portal.nav.contact') }}</h1>
        <p class="main-description">
          <span class="typewriter-text">{{ animatedDescription }}</span>
        </p>
      </div>
    </section>

    <!-- Contact Section (copied from About) -->
    <section id="contact" class="contact-section">
      <div class="container">
        <div class="contact-container">
          <!-- Contact Form -->
          <div class="contact-form">
            <form @submit.prevent="submitForm">
              <div class="form-item">
                <input v-model="formData.firstName" :placeholder="$t('portal.about.contact.form.firstName')" type="text" class="form-input" />
              </div>
              <div class="form-item">
                <input v-model="formData.lastName" :placeholder="$t('portal.about.contact.form.lastName')" type="text" class="form-input" />
              </div>
              <div class="form-item">
                <input v-model="formData.email" :placeholder="$t('portal.about.contact.form.email')" type="email" class="form-input" />
              </div>
              <div class="form-item">
                <textarea 
                  v-model="formData.message"
                  :placeholder="$t('portal.about.contact.form.message')"
                  class="form-textarea"
                  :class="{ 'over-limit': messageProgress.isOverLimit }"
                  rows="4"
                  :maxlength="MAX_MESSAGE_LENGTH + 50"
                ></textarea>
                <div class="message-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill"
                      :style="{ width: messageProgress.percentage + '%' }"
                      :class="{ 'progress-warning': messageProgress.percentage > 80, 'progress-error': messageProgress.isOverLimit }"
                    ></div>
                  </div>
                  <div class="character-count" :class="{ 'count-error': messageProgress.isOverLimit }">
                    {{ messageProgress.currentLength }} / {{ messageProgress.maxLength }}
                  </div>
                </div>
              </div>
              <button type="submit" class="submit-button">{{ $t('portal.about.contact.form.submit') }}</button>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" aria-hidden="true" focusable="false">
                  <rect x="5" y="12" width="40" height="26" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M6 13 L25 28 L44 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="contact-details">
                <h3>{{ $t('portal.about.contact.info.professor') }}</h3>
                <p>{{ $t('portal.about.contact.info.professorName') }}</p>
                <a href="mailto:zhouhao@air.tsinghua.edu.cn">zhouhao@air.tsinghua.edu.cn</a>
              </div>
            </div>
            
            <div class="contact-item">
              <h3>{{ $t('portal.about.contact.info.officialEmail') }}</h3>
              <a href="mailto:gen_si@163.com">gen_si@163.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
    <BackToTop />
  </div>
  
</template>

<style scoped>
.typewriter-text { position: relative; }
.typewriter-text::after { content: '|'; color: #000; font-weight: bold; animation: blink 1s infinite; margin-left: 0.125rem; }
@keyframes blink { 0%,50%{opacity:1;} 51%,100%{opacity:0;} }
.typewriter-text.completed::after { display:none; }

.contact-page {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Sora', sans-serif;
  font-weight: 400;
  /* Set header background to match top section */
  --portal-header-bg: #9ee8ff;
}

.container {
  max-width: 87.5rem;
  margin: 0 auto;
}

/* 768px以上的PC端设置宽度 */
@media (min-width: 769px) {
  .container {
    width: 65%;
    padding:1rem
  }
}

.header-section {
  background: #9ee8ff; /* keep in sync with --portal-header-bg */
  padding: 5rem 0 4.375rem 0;
  text-align: left;
}

.header.is-dark {
  background: #1a2a35;
}
/* 使 Contact 页头部区域与 About 页保持一致的容器宽度与内边距 */
.header-section .container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2.5rem;
  line-height: normal;
  max-width: 53.5625rem;
}

.main-description {
  font-size: 1.25rem;
  color: #000000;
  max-width: 53.5625rem;
  margin: 0;
  line-height: 2rem;
  font-weight: 400;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2.5rem;
  line-height: normal;
}

.contact-section {
  padding: 1.875rem 0 2.5rem 0;
  background: #ffffff;
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.875rem;
  align-items: flex-start;
  justify-content: space-between;
}

.contact-form {
  background: #ffffff;
  padding: 0;
  border-radius: 0;
  border: none;
}

.form-item {
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.form-item:focus-within {
  background-color: #d7ff39;
  border-radius: 1rem;
  padding: 0.75rem;
  transform: translateY(-0.375rem) translateX(-0.0625rem);
  box-shadow: 0.25rem 0.25rem 0 0 rgba(0, 0, 0, 1);
  z-index: 10;
}

.form-item:focus-within .form-input,
.form-item:focus-within .form-textarea {
  border-color: #000000;
  background-color: #ffffff;
}

.form-item:focus-within .message-progress {
  background-color: transparent;
}

.form-item:focus-within .progress-bar {
  background-color: rgba(255, 255, 255, 0.3);
}

.form-input, .form-textarea {
  width: 100%;
  border-radius: 1.25rem;
  border: 0.125rem solid #000000;
  font-size: 1.125rem;
  font-weight: 500;
  color: #000000;
  background: #ffffff;
  padding: 0 1.5rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input {
  height: 3.5rem;
}

.form-textarea {
  height: 5rem;
  padding: 1rem 1.5rem;
  resize: none;
  font-family: 'Sora', sans-serif;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-textarea.over-limit {
  border-color: #ff4757;
  box-shadow: 0 0 0 0.1875rem rgba(255, 71, 87, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.125rem;
  font-weight: 500;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #333333;
}

/* Message Progress Bar Styles */
.message-progress {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.5rem;
  background-color: #f0f0f0;
  border-radius: 0.25rem;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background-color: #d7ff39;
  border-radius: 0.25rem;
  transition: width 0.3s ease, background-color 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-fill.progress-warning {
  background-color: #ffa726;
}

.progress-fill.progress-error {
  background-color: #ff4757;
}

.character-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666666;
  white-space: nowrap;
  min-width: 5rem;
  text-align: right;
}

.character-count.count-error {
  color: #ff4757;
}

.submit-button {
  width: 100%;
  height: 3.5rem;
  border-radius: 1.25rem;
  background: #000000;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  border: 0.125rem solid #000000;
  margin-top: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: 'Sora', sans-serif;
}

.submit-button:hover {
  background: #333333;
}

.contact-info {
  background: #d7ff39;
  padding: 1.75rem 2rem;
  border-radius: 1.25rem;
  height: fit-content;
}

.contact-item {
  margin-bottom: 1.5rem;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  margin-bottom: 0.9375rem;
  color: #000000;
}

.contact-details h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
  line-height: normal;
}

.contact-details p {
  font-size: 1.125rem;
  color: #000000;
  margin: 0 0 0.5rem 0;
  font-weight: 400;
  line-height: normal;
}

.contact-details a,
.contact-item a {
  font-size: 1.125rem;
  color: #000000;
  text-decoration: underline;
  font-weight: 400;
  line-height: normal;
}

.contact-item h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.5rem 0;
  line-height: normal;
}

/* ========== Dark Mode Styles ========== */
.contact-page.is-dark {
  background: #121212;
  --portal-header-bg: #1a2a35;
}

.contact-page.is-dark .header-section {
  background: #1a2a35;
}

.contact-page.is-dark .main-title {
  color: #e0e0e0;
}

.contact-page.is-dark .main-description {
  color: #e0e0e0;
}

.contact-page.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.contact-page.is-dark .contact-section {
  background: #121212;
}

.contact-page.is-dark .contact-form {
  background: #121212;
}

.contact-page.is-dark .form-input,
.contact-page.is-dark .form-textarea {
  background: #2a2a2a;
  border-color: #555;
  color: #e0e0e0;
}

.contact-page.is-dark .form-input::placeholder,
.contact-page.is-dark .form-textarea::placeholder {
  color: rgba(224, 224, 224, 0.4);
}

.contact-page.is-dark .form-input:focus,
.contact-page.is-dark .form-textarea:focus {
  border-color: #9ee8ff;
}

.contact-page.is-dark .form-item:focus-within {
  background-color: #0d4a5e;
}

.contact-page.is-dark .form-item:focus-within .form-input,
.contact-page.is-dark .form-item:focus-within .form-textarea {
  border-color: #9ee8ff;
  background-color: #1a1a1a;
}

.contact-page.is-dark .progress-bar {
  background-color: #333;
}

.contact-page.is-dark .progress-fill {
  background-color: #9ee8ff;
}

.contact-page.is-dark .character-count {
  color: #999;
}

.contact-page.is-dark .submit-button {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.contact-page.is-dark .submit-button:hover {
  background: #9ee8ff;
}

.contact-page.is-dark .contact-info {
  background: #0d4a5e;
}

.contact-page.is-dark .contact-details h3,
.contact-page.is-dark .contact-item h3 {
  color: #e0e0e0;
}

.contact-page.is-dark .contact-details p {
  color: #ccc;
}

.contact-page.is-dark .contact-details a,
.contact-page.is-dark .contact-item a {
  color: #9ee8ff;
}

.contact-page.is-dark .contact-icon {
  color: #e0e0e0;
}

.contact-page.is-dark .section-title {
  color: #e0e0e0;
}

@media (max-width: 768px) {
  .header-section { padding: 80px 0 70px 0; text-align: left; }
  /* Header container fills width on mobile, following About page */
  .header-section .container { max-width: 100%; }
  .main-title { font-size: 28px; text-align: left; margin-bottom: 16px; line-height: 1.2; }
  .main-description { font-size: 15px; text-align: left; line-height: 28px; }
  .contact-container { grid-template-columns: 1fr; gap: 22px; }
  .contact-info { padding: 22px 18px; }
  .contact-details h3,
  .contact-item h3 { font-size: 20px; margin-bottom: 8px; }
  .contact-details p,
  .contact-details a,
  .contact-item a { font-size: 16px; }
  .form-input,
  .form-textarea { font-size: 15px; padding: 0 18px; }
  .form-input { height: 50px; }
  .form-textarea { height: 64px; padding: 14px 18px; }
  .form-input::placeholder,
  .form-textarea::placeholder { font-size: 15px; }
  .submit-button { height: 50px; font-size: 15px; }
  .form-item:focus-within { border-radius: 12px; padding: 8px; transform: translateY(-4px) translateX(-1px); box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 1); }
}


@media (max-width: 480px) {
  .container { padding: 0 12px; }
  .header-section { padding: 40px 0 60px 0; }
  .main-title { font-size: 28px; margin-bottom: 12px; line-height: 1.1; }
  .main-description { font-size: 14px; line-height: 22px; }
  .form-item { margin-bottom: 10px; }
  .form-input,
  .form-textarea { font-size: 14px; padding: 0 14px; border-radius: 14px; border-width: 1px; }
  .form-input { height: 44px; }
  .form-textarea { height: 48px; padding: 12px 14px; }
  .form-input::placeholder,
  .form-textarea::placeholder { font-size: 14px; }
  .submit-button { height: 44px; font-size: 14px; border-radius: 14px; border-width: 1px; margin-top: 10px; }
  .contact-info { padding: 18px 14px; border-radius: 14px; }
  .progress-bar { height: 5px; }
  .character-count { font-size: 12px; }
  .contact-item { margin-bottom: 24px; }
  .contact-details h3,
  .contact-item h3 { font-size: 18px; margin-bottom: 8px; }
  .contact-details p,
  .contact-details a,
  .contact-item a { font-size: 15px; }
  .form-item:focus-within { border-radius: 10px; padding: 6px; transform: translateY(-3px) translateX(-1px); box-shadow: 2px 2px 0 0 rgba(0, 0, 0, 1); }
}
</style>