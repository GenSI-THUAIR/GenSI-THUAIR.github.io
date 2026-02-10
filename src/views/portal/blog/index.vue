<template>
  <div class="blog-page">
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
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" :placeholder="$t('portal.blog.searchPlaceholder')"
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
          <div class="blog-item no-image" v-for="post in blogPosts" :key="post.id">
            <!-- Blog Content -->
            <div class="blog-content">
              <h3 class="blog-title" @click="navigateToDetail(post)">{{ post.title }}</h3>
              <p class="blog-description" v-if="post.subtitle">{{ post.subtitle }}</p>
              <p class="blog-description" v-if="post.introducing" v-html="post.introducing"></p>

              <div class="blog-meta">
                <div class="blog-info">
                  <span v-if="post.publish_time" class="blog-date">{{ formatDate(post.publish_time) }}</span>
                  <span v-if="post.readtime" class="blog-read-time">• {{ post.readtime }} min</span>
                </div>
              </div>
              <div class="blog-tags">
                <!-- Year tag -->
                <!-- <span v-if="post.publish_time" :key="'year-' + post.publish_time" class="blog-read-time">
                  #{{ post.publish_time.slice(0, 4) }}
                </span> -->
                <!-- Tags -->
                <!-- <template v-if="post.tags && post.tags.trim()">
                  <span v-for="(tag, index) in post.tags.split(',').map(t => t.trim()).filter(t => t)" 
                    :key="'tag-' + index" 
                    class="blog-read-time">
                    #{{ tag }}
                  </span>
                </template> -->
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

defineOptions({
  name: 'PortalBlog'
});

const message = useMessage();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

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

/* Blog Posts Section */
.blog-posts {
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
  padding: -1.5rem 1rem;
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

.filter-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #9ee8ff;
  color: #000000;
}

.filter-tag:hover::before {
  left: 100%;
}

.filter-tag.active {
  background: #9ee8ff;
  color: #000000;
  border-color: #9ee8ff;
  transform: translateY(-2px);
}

.filter-tag.active::before {
  display: none;
}

.filter-tag:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

/* Category tag specific styles */
.category-tag {
  background: #ffffff !important;
  border-color: #e0e0e0 !important;
  color: #666666 !important;
}

.category-tag:hover:not(.active) {
  border-color: #9ee8ff !important;
  color: #000000 !important;
  background: #ffffff !important;
}

.category-tag.active {
  background: #9ee8ff !important;
  border-color: #9ee8ff !important;
  color: #000000 !important;
  box-shadow: 0 4px 16px rgba(158, 232, 255, 0.3) !important;
}

/* Year tag specific styles */
.year-tag {
  background: #f8f9fa !important;
  border-color: #e0e0e0 !important;
  color: #495057 !important;
}

.year-tag:hover:not(.active) {
  border-color: #6c757d !important;
  color: #212529 !important;
  background: #e9ecef !important;
}

.year-tag.active {
  background: #6c757d !important;
  border-color: #6c757d !important;
  color: #ffffff !important;
  box-shadow: 0 4px 16px rgba(108, 117, 125, 0.3) !important;
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
  background: #e8f5e8;
  border-radius: 1.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  color: #2d5a2d;
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
  background: #d0e7d0;
  color: #2d5a2d;
}

/* Blog Post List */
.blog-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.blog-item {
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 2.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 2.5rem;
  align-items: start;
}

.blog-item.no-image {
  grid-template-columns: 1fr;
  gap: 0;
}

.blog-item:last-child {
  border-bottom: none;
}

.blog-image {
  width: 20rem;
  height: 15rem;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;
}

.blog-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blog-image:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0.75rem;
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

.blog-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.blog-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.tag-chip {
  padding: 0.25rem 0.625rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  letter-spacing: 0.5px;
}

.tag-year {
  background: #e8f5e8;
  color: #2e7d32;
}

.tag-category {
  background: #fff8e1;
  color: #f57c00;
}

.blog-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  margin: 0;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.3s ease;
}

.blog-title:hover {
  color: #666666;
}

.blog-description {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.25rem;
  color: #666666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.75rem;
}

.blog-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.blog-author {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  color: #666666;
  font-style: italic;
}

.blog-read-time {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #999999;
}

.blog-date {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #999999;
}

.read-more-btn {
  background: #000000;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.25rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.read-more-btn:hover {
  background: #333333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow-icon {
  transform: translateX(4px);
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
  background: #c8f030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(215, 255, 57, 0.3);
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

  .section-title {
    font-size: 28px;
  }

  .blog-posts {
    padding: 60px 0;
  }

  .section-header {
    margin-bottom: 40px;
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
    gap: 30px;
  }

  .blog-item {
    grid-template-columns: 1fr;
    gap: 20px;
    padding-bottom: 30px;
  }

  .blog-item.no-image {
    gap: 0;
  }

  .blog-image {
    width: 100%;
    height: 200px;
    max-width: 400px;
    margin: 0 auto;
  }

  .blog-title {
    font-size: 20px;
    margin-bottom: 12px;
  }

  .blog-description {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .blog-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .blog-info {
    gap: 8px;
  }

  .blog-author,
  .blog-read-time,
  .blog-date {
    font-size: 14px;
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

  .section-title {
    font-size: 24px;
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
    gap: 24px;
  }

  .blog-item {
    padding-bottom: 24px;
    gap: 16px;
  }

  .blog-item.no-image {
    gap: 0;
  }

  .blog-image {
    height: 160px;
  }

  .blog-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .blog-description {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .blog-info {
    gap: 8px;
  }

  .blog-author,
  .blog-read-time,
  .blog-date {
    font-size: 12px;
  }

  .read-more-btn {
    font-size: 12px;
    padding: 8px 16px;
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