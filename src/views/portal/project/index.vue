<template>
  <div class="project-page">
    <!-- Navigation Header -->
    <Header />

    <!-- Hero Section -->
    <section class="header-section">
      <div class="container">
        <Motion as="h1" class="main-title" :initial="{ opacity: 0, y: 50 }" :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }">
          {{ $t('portal.research.projects') }}
        </Motion>
        <div class="search-container search-container--inline">
          <div class="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.561 20.561L16.061 16.061M18.061 11.061C18.061 14.3747 15.3747 17.061 12.061 17.061C8.74728 17.061 6.06101 14.3747 6.06101 11.061C6.06101 7.74728 8.74728 5.06101 12.061 5.06101C15.3747 5.06101 18.061 7.74728 18.061 11.061Z"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" :placeholder="$t('portal.project.searchPlaceholder')"
            class="search-input" @keypress="handleKeyPress" @input="handleSearchInput" />
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="projects">
      <div class="container">

        <!-- Project List -->
        <div class="project-item" v-for="project in projects" :key="project.id">
          <div class="project-content">
            <h3 class="project-title">{{ getLocalizedProjectTitle(project) }}</h3>
            <div class="project-description" v-html="getLocalizedProjectDescription(project)"></div>
            <button class="btn btn-news" @click="toNewTab(project.link_url)">
              {{ $t('portal.research.readMore') }}
              <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="project-image" @click="openImagePreview(project.cover, project.title)">
            <img :src="project.cover" alt="Project visualization" />
            <div class="image-overlay">
              <svg class="preview-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ $t('portal.research.clickToPreview') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

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

    <!-- Footer -->
    <Footer />

    <!-- 返回顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Motion } from "motion-v"
// @ts-ignore
import Header from '../components/Header.vue';
// @ts-ignore
import Footer from '../components/Footer.vue';
// @ts-ignore
import BackToTop from '../components/BackToTop.vue';
import { useRouter } from 'vue-router';
import supabase from '@/supabase/supabase';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

defineOptions({
  name: 'PortalProject'
})

const router = useRouter();
const appStore = useAppStore();

// Projects data
const projects = ref<any[]>([])
const allProjects = ref<any[]>([])

// Search state
const searchQuery = ref<string>('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Image Preview State
const imagePreview = ref({
  show: false,
  src: '',
  title: ''
})

// Get projects from database
const getProjects = async () => {
  const { data, error } = await supabase.from('project').select('*').order('sort', { ascending: true })
  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  return data || []
}

// Filter projects based on search query
const filterProjects = () => {
  if (!searchQuery.value.trim()) {
    projects.value = [...allProjects.value]
    return
  }

  const query = searchQuery.value.toLowerCase().trim()
  projects.value = allProjects.value.filter((project) => {
    const title = getLocalizedProjectTitle(project).toLowerCase()
    const description = getLocalizedProjectDescription(project).toLowerCase()
    return title.includes(query) || description.includes(query)
  })
}

// Handle search input with debounce
const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    filterProjects()
  }, 300) // 300ms debounce
}

// 处理回车键搜索
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    filterProjects()
  }
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  filterProjects()
}

// Open image preview
const openImagePreview = (src: string, title: string) => {
  imagePreview.value.src = src
  imagePreview.value.title = title
  imagePreview.value.show = true
}

// Close image preview
const closeImagePreview = () => {
  imagePreview.value.show = false
}

// Open link in new tab
function toNewTab(url: string) {
  if (!url) return;
  window.open(url, '_blank');
}

// Get localized project title
function getLocalizedProjectTitle(project: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (project.title_cn || project.title)
    : (project.title || project.title_cn);
}

// Get localized project description
function getLocalizedProjectDescription(project: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (project.content_cn || project.description)
    : (project.description || project.content_cn);
}

// ESC key handler for image preview
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && imagePreview.value.show) {
    closeImagePreview()
  }
}

// ===== Rem 基准缩放（PC 无级响应式）=====
const remBaselineWidth = 1700;
const remBaseFontPx = 16;
let originalRootFontSize = '' as string;

function updateRootRem() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const width = window.innerWidth || remBaselineWidth;
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

  // Load projects data
  const data = await getProjects()
  allProjects.value = data
  projects.value = [...data]
  console.log(projects.value)

  // Add ESC key listener
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  // Remove ESC key listener
  document.removeEventListener('keydown', handleEscKey)

  // Clear search timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // 清理 resize 防抖与恢复根字号
  window.removeEventListener('resize', debouncedHandleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = originalRootFontSize
  }
})
</script>

<style scoped>
@import '../assests/common.css';

.project-page {
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.header {
  background: #d7ff39;
  border-bottom: none;
}

/* Hero Section */
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
  width: 20rem;
}

.search-container {
  position: relative;
  border-bottom: 0.125rem solid #000000;
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

/* Projects Section */
.projects {
  padding: 5rem 0;
  background: #f0f0f0;
}

.section-header {
  margin-bottom: 2.5rem;
}

.section-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  position: relative;
  width: 18.75rem;
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 0.0625rem solid #c0c0c0;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: #666666;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.search-bar:hover .search-icon,
.search-bar.focused .search-icon {
  color: #000000;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  font-family: 'Sora', sans-serif;
  color: #000000;
  padding: -2rem 1rem;
  min-width: 0;
}

.search-input::placeholder {
  color: #999999;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.search-bar:hover .search-input::placeholder,
.search-bar.focused .search-input::placeholder {
  color: #666666;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666666;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-right: 0.25rem;
}

.clear-button:hover {
  background: #e0e0e0;
  color: #000000;
  transform: scale(1.1);
}

.clear-button:active {
  transform: scale(0.95);
}

.project-item {
  display: grid;
  grid-template-columns: 1fr 20rem;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
  align-items: start;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 2.5rem;
}

.project-item:last-child {
  border-bottom: none;
}

.project-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.project-description {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.125rem;
  color: #000000;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-description ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 1rem;
}

.project-description li {
  margin-bottom: 0.5rem;
}

.btn-news {
  background: black;
  color: white;
  align-self: flex-start;
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
}

.btn-news::after {
  content: '';
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  background: black;
  border-radius: 50%;
  top: -0.375rem;
  right: -0.375rem;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.btn-news:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  color: #d7ff39;
}

.btn-news:hover::after {
  opacity: 1;
  transform: scale(1);
}

.btn-news:hover .arrow-icon {
  transform: rotate(0deg);
}

.project-image {
  background: #ffffff;
  border-radius: 1rem;
  padding: 0.75rem;
  width: 20rem;
  height: 14.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: auto 0;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.75rem;
  transition: transform 0.3s ease;
}

.project-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.project-image:hover img {
  transform: scale(1.02);
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

.project-image:hover .image-overlay {
  opacity: 1;
  pointer-events: auto;
}

.preview-icon {
  width: 3rem;
  height: 3rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.image-overlay span {
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Image Preview Modal Styles */
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: scale(0.9) translateY(-20px);
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
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
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
  background: #e0e0e0;
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #666666;
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .container {
    max-width: 90%;
    padding: 0 1rem;
  }

  .header-section {
    padding: 3.75rem 0;
  }

  .header-section .container {
    max-width: 95%;
  }

  .main-title {
    font-size: 2.25rem;
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

  .section-header {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .projects {
    padding: 3rem 0;
  }

  .project-item {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 32px;
    padding-bottom: 32px;
  }

  .project-content {
    order: 2;
    text-align: left;
  }

  .project-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .project-description {
    font-size: 16px;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-image {
    order: 1;
    width: 100%;
    height: 200px;
    margin: 0 auto 12px;
    max-width: 400px;
    padding: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
  }

  .project-image img {
    object-fit: cover;
    object-position: center;
    border-radius: 12px;
  }

  .project-image:hover img {
    transform: none;
  }

  .image-preview-container {
    width: 95%;
    max-height: 95vh;
    margin: 0 10px;
  }

  .image-preview-header {
    padding: 16px 20px;
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
  .container {
    max-width: 95%;
    padding: 0 0.75rem;
  }

  .header-section {
    padding: 2.5rem 0;
  }

  .main-title {
    font-size: 1.75rem;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1.5rem;
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

  .projects {
    padding: 2rem 0;
  }

  .project-item {
    gap: 16px;
    margin-bottom: 28px;
    padding-bottom: 28px;
  }

  .project-content {
    order: 2;
    text-align: left;
  }

  .project-title {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .project-description {
    font-size: 14px;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-image {
    order: 1;
    height: 160px;
    margin: 0 auto 10px;
    max-width: 400px;
    padding: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
  }

  .btn-news {
    padding: 14px 28px;
    font-size: 14px;
    margin-top: 16px;
    align-self: flex-start;
  }

  .image-preview-container {
    width: 98%;
    max-height: 98vh;
    margin: 0 4px;
    border-radius: 8px;
  }

  .image-preview-header {
    padding: 12px 16px;
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
