<template>
  <div class="blog-page" :class="{ 'is-dark': isDark }">
    <!-- Navigation Header -->
    <Header />

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <Motion as="h1" class="hero-title" :initial="{ opacity: 0, y: 50 }" :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }">
          {{ $t('portal.blog.blogsFromGensi') }}
        </Motion>
        <div class="search-container search-container--inline">
          <div class="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.561 20.561L16.061 16.061M18.061 11.061C18.061 14.3747 15.3747 17.061 12.061 17.061C8.74728 17.061 6.06101 14.3747 6.06101 11.061C6.06101 7.74728 8.74728 5.06101 12.061 5.06101C15.3747 5.06101 18.061 7.74728 18.061 11.061Z"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" :placeholder="$t('portal.publications.searchPlaceholder')"
            class="search-input" @keypress="handleKeyPress" @input="handleSearchInput" />
        </div>
      </div>
    </section>

    <!-- Blog Posts Section -->
    <section class="blog-posts">
      <div class="container">
        <div class="filter-section">
          <!-- <div class="filter-group">
            <h4 class="filter-group-title">Tags</h4>
            <div class="filter-tags">
              <button class="filter-tag category-tag" :class="{ active: activeCategoryFilter === 'all' }"
                @click="setActiveCategoryFilter('all')">
                #All
              </button>
              <button v-for="tag in categoryTags" :key="tag.id"
                :class="['filter-tag', 'category-tag', { active: activeCategoryFilter === tag.id }]"
                @click="setActiveCategoryFilter(tag.id)">
                #{{ tag.label }}
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <h4 class="filter-group-title">{{ $t('portal.blog.years') || 'Years' }}</h4>
            <div class="filter-tags">
              <button class="filter-tag year-tag" :class="{ active: activeYearFilter === 'all' }"
                @click="setActiveYearFilter('all')">
                #All
              </button>
              <button v-for="tag in yearTags" :key="tag.id"
                :class="['filter-tag', 'year-tag', { active: activeYearFilter === tag.id }]"
                @click="setActiveYearFilter(tag.id)">
                #{{ tag.label }}
              </button>
            </div>
          </div> -->

          <!-- Active filters display -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="active-filters-label">{{ $t('portal.blog.activeFilters') }}</span>
            <div class="active-filter-tags">
              <span v-if="activeCategoryFilter !== 'all'" class="active-filter-item">
                <span class="filter-name">{{ activeCategoryLabel }}</span>
                <button @click="setActiveCategoryFilter('all')" class="remove-filter">×</button>
              </span>
              <span v-if="activeYearFilter !== 'all'" class="active-filter-item">
                <span class="filter-name">{{ getFilterLabel(activeYearFilter) }}</span>
                <button @click="setActiveYearFilter('all')" class="remove-filter">×</button>
              </span>
              <span v-if="searchQuery" class="active-filter-item">
                <span class="filter-name">Search: "{{ searchQuery }}"</span>
                <button @click="clearSearch" class="remove-filter">×</button>
              </span>
            </div>
          </div>
        </div>

        <!-- Blog Post List -->
        <div class="blog-list" ref="blogListRef">
          <div class="blog-card horizontal-card" v-for="post in blogPosts" :key="post.id">
            <!-- Blog Content -->
            <div class="blog-content">
              <h3 class="blog-title" @click="navigateToDetail(post)">{{ post.title }}</h3>
              <p class="blog-description" v-if="post.subtitle">{{ post.subtitle }}</p>
              <p class="blog-description" v-if="post.introducing" v-html="post.introducing"></p>

              <div class="blog-footer">
                <button class="btn btn-blog" @click="navigateToDetail(post)">
                  {{ $t('portal.home.readMore') || 'Read More' }}
                  <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
                <span class="blog-date">{{ post.publish_time ? formatDate(post.publish_time) : '' }}</span>
              </div>
            </div>
            <div v-if="post.blog_img" class="blog-image" @click="openImagePreview(post.blog_img, post.title)">
              <img :src="post.blog_img" :alt="post.title" @error="handleImageError" loading="lazy" />
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

          <!-- Loading indicator -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <span class="loading-text">Loading posts...</span>
          </div>

          <!-- No more data indicator -->
          <div v-if="!hasMore && blogPosts.length > 0" class="no-more-data">
            <span>No more blogs to load</span>
          </div>

          <!-- Empty state -->
          <div v-if="blogPosts.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No blog posts found</h3>
            <p v-if="hasActiveFilters">Try adjusting your filters or search terms.</p>
            <p v-else>There are currently no blog posts available.</p>
            <button v-if="hasActiveFilters" @click="clearAllFilters" class="clear-filters-btn">
              Clear all filters
            </button>
          </div>

          <!-- Load more trigger element for intersection observer -->
          <div v-if="blogPosts.length > 0 && hasMore" ref="loadMoreTrigger" class="load-more-trigger"></div>
        </div>
      </div>
    </section>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="imagePreview.show" class="image-preview-modal" @click="closeImagePreview">
        <div class="image-preview-container">
          <div class="image-preview-header">
            <h3 class="image-preview-title">{{ imagePreview.title }}</h3>
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Motion } from "motion-v";
// @ts-ignore
import Header from '../components/Header.vue';
// @ts-ignore
import Footer from '../components/Footer.vue';
// @ts-ignore
import BackToTop from '../components/BackToTop.vue';
import supabase from '@/supabase/supabase';
import { useMessage } from 'naive-ui';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useSeo } from '@/composables/useSeo';

defineOptions({
  name: 'PortalBlog'
});

useSeo({
  title: 'Blog',
  description: 'Latest blog posts from GenSI Lab covering AI research, experiments, and insights.',
  keywords: 'GenSI, blog, AI, research blog, machine learning',
});

const message = useMessage();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// Define filter tag interface
interface FilterTag {
  id: string
  label: string
  count?: number
}

// Blog posts data
const blogPosts = ref<any[]>([])
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(false)
const currentPage = ref<number>(0)
const pageSize = ref<number>(10)
const blogListRef = ref<HTMLElement | null>(null)
const totalCount = ref<number>(0)
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const intersectionObserver = ref<IntersectionObserver | null>(null)

// Filter tags data
const tagOptions = [
  { id: 'attention', label: 'attention' },
  { id: 'transformers', label: 'transformers' },
  { id: 'generation', label: 'generation' },
  { id: 'multi-modality', label: 'multi-modality' },
  { id: 'NLP', label: 'NLP' },
  { id: 'language-models', label: 'language-models' },
  { id: 'diffusion-models', label: 'diffusion-models' }
]

const categoryTags = ref<FilterTag[]>([])

// Year filter tags
const yearTags = ref<FilterTag[]>([])

// Combined filter tags
const allFilterTags = computed(() => {
  return [...categoryTags.value, ...yearTags.value]
})

// Separate filter states
const activeCategoryFilter = ref<string>('all')
const activeYearFilter = ref<string>('all')

// Search state
const searchQuery = ref<string>('')

// Computed properties
const hasActiveFilters = computed(() => {
  return activeCategoryFilter.value !== 'all' || activeYearFilter.value !== 'all' || searchQuery.value.trim() !== ''
})

const activeCategoryLabel = computed(() => {
  const tag = tagOptions.find(t => t.id === activeCategoryFilter.value)
  return tag ? tag.label : activeCategoryFilter.value
})

// Helper functions
const getFilterLabel = (filterId: string) => {
  const tag = allFilterTags.value.find(t => t.id === filterId)
  return tag ? tag.label : filterId
}

const clearAllFilters = () => {
  setActiveCategoryFilter('all')
  setActiveYearFilter('all')
  clearSearch()
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Get tag counts from database
const getTagCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('gensiblog')
      .select('publish_time, tags')
      .eq('isshow', 1)

    if (error) {
      console.error('Error fetching tag counts:', error)
      return
    }

    // Year counters
    const yearCounts: Record<string, number> = {}
    const yearsSet = new Set<string>()
    
    // Tag counters
    const tagCounts: Record<string, number> = {}

    // Collect years and tags
    if (data) {
      data.forEach((item: any) => {
        // Count years
        if (item.publish_time) {
          const year = item.publish_time.substring(0, 4)
          yearsSet.add(year)
          yearCounts[year] = (yearCounts[year] || 0) + 1
        }
        
        // Count tags
        if (item.tags && typeof item.tags === 'string') {
          const tagsArray = item.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
          tagsArray.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })
    }

    // Generate year tags from collected years, sorted in descending order
    const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
    yearTags.value = sortedYears.map(year => ({
      id: year,
      label: year,
      count: yearCounts[year] || 0
    }))
    
    // Generate category tags with counts
    categoryTags.value = tagOptions.map(tag => ({
      id: tag.id,
      label: tag.label,
      count: tagCounts[tag.id] || 0
    }))
  } catch (error) {
    console.error('Error in getTagCounts:', error)
  }
}

// Get blog posts from gensiblog database
const getBlogPosts = async (page: number = 0, size: number = 10) => {
  try {
    loading.value = true

    const from = page * size
    const to = from + size - 1

    let query = supabase
      .from('gensiblog')
      .select('*')
      .eq('isshow', 1)
      .order('publish_time', { ascending: false })

    // Apply search filter
    if (searchQuery.value.trim()) {
      const searchTerm = searchQuery.value.trim()
      query = query.or(`title.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,team.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,introducing.ilike.%${searchTerm}%`)
    }

    // Apply year filter if not 'all'
    if (activeYearFilter.value !== 'all') {
      query = query.ilike('publish_time', `${activeYearFilter.value}%`)
    }
    
    // Apply category (tags) filter if not 'all'
    if (activeCategoryFilter.value !== 'all') {
      query = query.ilike('tags', `%${activeCategoryFilter.value}%`)
    }

    // Apply pagination
    query = query.range(from, to)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    // Check if there are more posts
    if (!data || data.length < size) {
      hasMore.value = false
    }

    return data || []
  } catch (error) {
    console.error('Error in getBlogPosts:', error)
    return []
  } finally {
    loading.value = false
  }
}

// Load more blog posts
const loadMoreBlogPosts = async () => {
  if (loading.value || !hasMore.value) return

  currentPage.value++
  const newPosts = await getBlogPosts(currentPage.value, pageSize.value)

  if (newPosts.length > 0) {
    blogPosts.value.push(...newPosts)
  }
}

// Initial load
const loadInitialBlogPosts = async () => {
  currentPage.value = 0
  hasMore.value = true
  blogPosts.value = []

  const initialData = await getBlogPosts(0, pageSize.value)
  blogPosts.value = initialData

  // Reset Intersection Observer
  await nextTick()
  setupIntersectionObserver()
}

// Set active category filter function
const setActiveCategoryFilter = async (filterId: string) => {
  if (activeCategoryFilter.value === filterId) return

  activeCategoryFilter.value = filterId
  await loadInitialBlogPosts()
}

// Set active year filter function
const setActiveYearFilter = async (filterId: string) => {
  if (activeYearFilter.value === filterId) return

  activeYearFilter.value = filterId
  await loadInitialBlogPosts()
}

// Search functions
const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    loadInitialBlogPosts()
  }, 500)
}

// 处理回车键搜索
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  await loadInitialBlogPosts()
}

const clearSearch = async () => {
  searchQuery.value = ''
  await loadInitialBlogPosts()
}

// Navigate to blog detail page
const navigateToDetail = (post: any) => {
  if (post.id) {
    router.push({ name: 'portal_blogdetail', query: { id: post.id } })
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

// Setup intersection observer for infinite scroll
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return

  // Clean up existing observer
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }

  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        loadMoreBlogPosts()
      }
    },
    {
      root: null,
      rootMargin: '200px',
      threshold: 0
    }
  )

  intersectionObserver.value.observe(loadMoreTrigger.value)
}

// Image preview
const imagePreview = ref({
  show: false,
  src: '',
  title: ''
});

const openImagePreview = (src: string, title: string) => {
  imagePreview.value.src = src;
  imagePreview.value.title = title;
  imagePreview.value.show = true;
};

const closeImagePreview = () => {
  imagePreview.value.show = false;
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && imagePreview.value.show) {
    closeImagePreview();
  }
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = 'https://gensi-1313402205.cos.ap-guangzhou.myqcloud.com/news/cover/1754832796362-1.png';
};

// Navigate to new tab
const toNewTab = (url: string) => {
  if (!url) return;
  window.open(url, '_blank');
}

// Lifecycle hooks
onMounted(async () => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  document.addEventListener('keydown', handleEscKey);

  // Get tag counts
  await getTagCounts()
  // Load blog posts
  await loadInitialBlogPosts()

  // Setup intersection observer
  await nextTick()
  setupIntersectionObserver()
})

// Watch for route changes
watch(() => route.name, async (newRouteName) => {
  if (newRouteName === 'portal_blog') {
    await getTagCounts()
    await loadInitialBlogPosts()
  }
}, { immediate: false })

onUnmounted(() => {
  // Disconnect intersection observer
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }

  // Clear search timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // 清理事件监听
  document.removeEventListener('keydown', handleEscKey);
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

.blog-page {
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.header {
  background: #9ee8ff;
  border-bottom: none;
}

/* 修改暗色系的背景颜色 */
.header.is-dark {
  background: #1a2a35;
}

/* Hero Section */
.hero {
  padding: 5rem 0 4.375rem 0;
  background: #9ee8ff;
  text-align: left;
}

.hero-title {
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
  font-size: 1rem;
  color: #000000;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1rem;
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

/* Blog Posts Section */
.blog-posts {
  padding: 5rem 0;
  background: #f5f5f5;
}

/* Filter Section */
.filter-section {
  margin-bottom: 3.75rem;
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-group-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 1rem 0;
}

.filter-tags {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 0.75rem 1.5rem;
  border-radius: 3.125rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 0.125rem solid transparent;
  background: #ffffff;
  color: #666666;
  position: relative;
  overflow: hidden;
  min-width: 5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #9ee8ff;
  color: #000000;
}

.filter-tag.active {
  background: #9ee8ff;
  color: #000000;
  border-color: #9ee8ff;
  transform: translateY(-2px);
}

.filter-tag:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.active-filters-label {
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  color: #666666;
  font-weight: 500;
}

.active-filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.active-filter-item {
  display: flex;
  align-items: center;
  background: #e0f2fe;
  border-radius: 1.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #0369a1;
  gap: 0.5rem;
}

.filter-name {
  font-family: 'Sora', sans-serif;
  font-weight: 500;
}

.remove-filter {
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-filter:hover {
  background: #bae6fd;
  color: #0369a1;
}

/* Blog Post List - Card Style like News */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin: 0 auto;
}

.blog-card {
  background: #ffffff;
  border: 0.125rem solid #000000;
  border-radius: 1.5rem;
  padding: 2rem 3rem;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.blog-card.horizontal-card {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: start;
  border: 0.15rem solid #000;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.blog-card.horizontal-card:hover {
  border: 0.15rem solid #000;
  transform: translateY(-0.2rem) translateX(-0.1rem);
  box-shadow: 0.3rem 0.3rem 0 0 rgba(0, 0, 0, 1);
  background: linear-gradient(135deg, #c9eeff 0%, #a8dfff 50%, #9ee8ff 100%);
  transition: all 1s ease;
}

.blog-card.horizontal-card > * {
  position: relative;
  z-index: 1;
}

.blog-image {
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

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.blog-image:hover .image-overlay {
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
  font-size: 0.875rem;
  font-weight: 600;
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.blog-image:hover img {
  transform: scale(1.05);
}

.blog-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.blog-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  line-height: 1.4;
  margin-bottom: 1.25rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.blog-title:hover {
  color: #666666;
}

.blog-description {
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
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.btn-blog {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #000000;
  color: #ffffff;
  border: 2px solid #000;
  border-radius: 0.75rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: auto;
  position: relative;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-blog::after {
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

.btn-blog:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  color: #7ecef4;
}

.btn-blog:hover::after {
  opacity: 1;
  transform: scale(1);
}

.btn-blog:hover .arrow-icon {
  transform: rotate(0deg);
  stroke: #7ecef4;
}

.btn-blog:active {
  transform: translateY(-1px);
  transition: transform 0.1s ease;
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: all 0.3s ease;
}

.blog-date {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #000000;
  opacity: 0.8;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.25rem;
  gap: 1rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid #f3f3f3;
  border-top: 0.25rem solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  color: #666666;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.no-more-data {
  text-align: center;
  padding: 2.5rem 1.25rem;
  color: #666666;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 1.25rem;
  color: #666666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.25rem;
}

.empty-state h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 0.75rem;
}

.empty-state p {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 31.25rem;
  margin-left: auto;
  margin-right: auto;
}

.clear-filters-btn {
  background: #9ee8ff;
  color: #000000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #7ecef4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(158, 232, 255, 0.3);
}

/* Load More Trigger */
.load-more-trigger {
  height: 0.0625rem;
  width: 100%;
  margin-top: 1.25rem;
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
  from { opacity: 0; }
  to { opacity: 1; }
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
  from { transform: scale(0.9) translateY(-1.25rem); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.image-preview-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.image-preview-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
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
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
}

/* ========== Dark Mode Styles ========== */
.blog-page.is-dark {
  background: #121212;
}

.blog-page.is-dark .hero {
  background: #1a2a35;
}

.blog-page.is-dark .hero-title {
  color: #e0e0e0;
}

.blog-page.is-dark .search-container {
  border-bottom-color: #e0e0e0;
  color: #e0e0e0;
}

.blog-page.is-dark .search-input {
  color: #e0e0e0;
  border-bottom-color: #e0e0e0;
}

.blog-page.is-dark .search-input::placeholder {
  color: rgba(224, 224, 224, 0.5);
}

.blog-page.is-dark .blog-posts {
  background: #1a1a1a;
}

.blog-page.is-dark .filter-group-title {
  color: #e0e0e0;
}

.blog-page.is-dark .filter-tag {
  background: #2a2a2a;
  color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.blog-page.is-dark .filter-tag:hover {
  border-color: #9ee8ff;
  color: #e0e0e0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.blog-page.is-dark .filter-tag.active {
  background: #0d4a5e;
  color: #9ee8ff;
  border-color: #9ee8ff;
}

.blog-page.is-dark .active-filters-label {
  color: #999;
}

.blog-page.is-dark .active-filter-item {
  background: #1a3a4a;
  color: #9ee8ff;
}

.blog-page.is-dark .remove-filter {
  color: #999;
}

.blog-page.is-dark .remove-filter:hover {
  background: #0d4a5e;
  color: #9ee8ff;
}

.blog-page.is-dark .blog-card {
  background: #222222;
  border-color: #444;
}

.blog-page.is-dark .blog-card.horizontal-card {
  border-color: #444;
}

.blog-page.is-dark .blog-card.horizontal-card:hover {
  border-color: #666;
  box-shadow: 0.3rem 0.3rem 0 0 rgba(158, 232, 255, 0.3);
  background: linear-gradient(135deg, #1a3a4a 0%, #0d4a5e 50%, #1a5570 100%);
}

.blog-page.is-dark .blog-title {
  color: #e0e0e0;
}

.blog-page.is-dark .blog-title:hover {
  color: #9ee8ff;
}

.blog-page.is-dark .blog-description,
.blog-page.is-dark .blog-description :deep(*) {
  color: #ccc !important;
}

.blog-page.is-dark .blog-date {
  color: #999;
}

.blog-page.is-dark .btn-blog {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.blog-page.is-dark .btn-blog:hover {
  background: #9ee8ff;
  color: #1a1a1a;
  box-shadow: 0 6px 20px rgba(158, 232, 255, 0.3);
}

.blog-page.is-dark .btn-blog:hover .arrow-icon {
  stroke: #1a1a1a;
}

.blog-page.is-dark .btn-blog::after {
  background: #e0e0e0;
  border-color: #e0e0e0;
}

.blog-page.is-dark .blog-image {
  background: #2a2a2a;
}

.blog-page.is-dark .image-preview-container {
  background: #2a2a2a;
}

.blog-page.is-dark .image-preview-header {
  background: #333;
  border-bottom-color: #444;
}

.blog-page.is-dark .image-preview-title {
  color: #e0e0e0;
}

.blog-page.is-dark .close-btn:hover {
  background: #444;
}

.blog-page.is-dark .close-btn svg {
  color: #ccc;
}

.blog-page.is-dark .loading-spinner {
  border-color: #333;
  border-top-color: #9ee8ff;
}

.blog-page.is-dark .loading-text {
  color: #999;
}

.blog-page.is-dark .no-more-data {
  color: #999;
}

.blog-page.is-dark .empty-state {
  color: #999;
}

.blog-page.is-dark .empty-state h3 {
  color: #e0e0e0;
}

.blog-page.is-dark .clear-filters-btn {
  background: #0d4a5e;
  color: #9ee8ff;
}

.blog-page.is-dark .clear-filters-btn:hover {
  background: #1a5570;
  box-shadow: 0 4px 12px rgba(158, 232, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    max-width: 95%;
    padding: 0 16px;
  }

  .hero {
    padding: 60px 0;
  }

  .hero-title {
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

  .blog-posts {
    padding: 60px 0;
  }

  .filter-section {
    margin-bottom: 40px;
  }

  .filter-tags {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 30px;
  }

  .filter-tag {
    font-size: 14px;
    padding: 10px 20px;
    min-width: 70px;
  }

  .blog-list {
    gap: 20px;
  }

  .blog-card.horizontal-card {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    padding: 24px;
    background: #fff;
    border: 2px solid #000;
    transform: none;
    box-shadow: none;
  }

  .blog-content {
    display: flex !important;
    flex-direction: column !important;
    order: 2;
  }

  .blog-footer {
    order: 4 !important;
  }

  .blog-title {
    font-size: 20px;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .blog-description {
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

  .blog-image {
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

  .blog-image img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .blog-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
    margin-top: 16px !important;
  }

  .btn-blog {
    padding: 8px 16px !important;
    font-size: 14px !important;
    background: #000 !important;
    color: #fff !important;
    border-radius: 8px !important;
    align-self: flex-start !important;
    border: none;
    flex-shrink: 0 !important;
  }

  .blog-date {
    font-size: 14px;
    flex-shrink: 0 !important;
  }
}

@media (max-width: 480px) {
  .container {
    max-width: 98%;
    padding: 0 12px;
  }

  .hero {
    padding: 40px 0 60px;
  }

  .hero-title {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .blog-posts {
    padding: 40px 0;
  }

  .filter-section {
    margin-bottom: 30px;
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

  .filter-tag {
    font-size: 12px;
    padding: 8px 16px;
    min-width: 60px;
  }

  .blog-list {
    gap: 16px;
  }

  .blog-card.horizontal-card {
    padding: 16px;
    border-radius: 16px;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .blog-footer {
    order: 4 !important;
  }

  .blog-title {
    font-size: 16px;
    line-height: 1.3;
    margin-bottom: 8px;
  }

  .blog-description {
    font-size: 16px !important;
    line-height: 1.4 !important;
    margin-bottom: 10px !important;
  }

  .blog-image {
    height: 140px !important;
    margin-bottom: 12px !important;
    border-radius: 12px !important;
  }

  .blog-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 10px !important;
    margin-top: 12px !important;
  }

  .btn-blog {
    padding: 6px 14px !important;
    font-size: 12px !important;
    flex-shrink: 0 !important;
  }

  .blog-date {
    font-size: 12px;
    flex-shrink: 0 !important;
  }
}
</style>