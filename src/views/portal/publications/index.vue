<template>
  <div class="publications-page">
    <!-- Navigation Header -->
    <Header />

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <Motion as="h1" class="hero-title" :initial="{ opacity: 0, y: 50 }" :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }">
          {{ $t('portal.research.publications') }}
        </Motion>
        <div class="search-container search-container--inline">
          <div class="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.561 20.561L16.061 16.061M18.061 11.061C18.061 14.3747 15.3747 17.061 12.061 17.061C8.74728 17.061 6.06101 14.3747 6.06101 11.061C6.06101 7.74728 8.74728 5.06101 12.061 5.06101C15.3747 5.06101 18.061 7.74728 18.061 11.061Z"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" :placeholder="$t('portal.publications.searchPlaceholder')"
            class="search-input" @keypress="handleKeyPress" @input="handleSearchInput" />
        </div>
      </div>
    </section>

    <!-- Publications Section -->
    <section class="publications">
      <div class="container">


        <!-- Filter Tags -->
        <div class="filter-section">
          <!-- Conference Tags -->
          <div class="filter-group">
            <h4 class="filter-group-title">{{ $t('portal.research.conferences') || 'Conferences' }}</h4>
            <div class="filter-tags">
              <button v-for="tag in filterTags" :key="tag.id"
                :class="['filter-tag', 'conference-tag', { active: activeConferenceFilter === tag.id }]"
                @click="setActiveConferenceFilter(tag.id)">
                {{ tag.label }}
              </button>
            </div>
          </div>

          <!-- Year Tags -->
          <div class="filter-group">
            <h4 class="filter-group-title">{{ $t('portal.research.years') || 'Years' }}</h4>
            <div class="filter-tags">
              <button class="filter-tag year-tag" :class="{ active: activeYearFilter === 'all' }"
                @click="setActiveYearFilter('all')">
                All
              </button>
              <button v-for="tag in yearTags" :key="tag.id"
                :class="['filter-tag', 'year-tag', { active: activeYearFilter === tag.id }]"
                @click="setActiveYearFilter(tag.id)">
                {{ tag.label }}
              </button>
            </div>
          </div>

          <!-- Active filters display -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="active-filters-label">{{ $t('portal.research.activeFilters') }}</span>
            <div class="active-filter-tags">
              <span v-if="activeConferenceFilter !== 'all'" class="active-filter-item">
                <span class="filter-name">{{ getFilterLabel(activeConferenceFilter) }}</span>
                <button @click="setActiveConferenceFilter('all')" class="remove-filter">×</button>
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

        <!-- Publication List -->
        <div class="publication-list" ref="publicationListRef">
          <div class="publication-item" v-for="publication in publications" :key="publication.id">
            <!-- Publication Image -->
            <div class="publication-image"
              @click="openImagePreview(publication.cover || 'https://gensi-1313402205.cos.ap-guangzhou.myqcloud.com/news/cover/1754832796362-1.png', publication.title)">
              <img
                :src="publication.cover || 'https://gensi-1313402205.cos.ap-guangzhou.myqcloud.com/news/cover/1754832796362-1.png'"
                :alt="publication.title" @error="handleImageError" loading="lazy" />
              <div class="image-overlay">
                <svg class="preview-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                </svg>
                <span>{{ $t('portal.home.clickToPreview') }}</span>
              </div>
            </div>

            <!-- Publication Content -->
            <div class="publication-content">
              <!-- Tags display -->
              <div class="publication-tags">
                <!-- Original tags from publication.tag -->
                <!-- <span 
                  v-for="tag in getPublicationTags(publication.tag || '')" 
                  :key="tag"
                  :class="['tag-chip', getTagClass(tag)]"
                >
                  {{ tag }}
                </span> -->

                <!-- Year tag -->
                <span v-if="publication.date" :key="'year-' + publication.date" class="tag-chip tag-year">
                  {{ publication.date.slice(0, 4) }}
                </span>

                <!-- Conference/Booktitle tag -->
                <span v-if="publication.meeting" :key="'conf-' + publication.meeting" class="tag-chip tag-conference">
                  {{ publication.meeting }}
                </span>
              </div>

              <h3 class="publication-title">{{ publication.title }}</h3>
              <p v-if="publication.author" class="publication-author">by {{ publication.author }}</p>
              <!-- <p class="publication-description">
                {{ publication.content }}
              </p> -->
              <div class="publication-meta">
                <div class="publication-links">
                  <a href="#" class="publication-link" @click.prevent="showBibModal(publication)">Bib</a>
                  <a v-if="publication.code_url" style="margin-left: 10px;" :href="publication.code_url" target="_blank"
                    class="publication-link">Code</a>
                  <a v-if="publication.link_url" style="margin-left: 10px;" :href="publication.link_url" target="_blank"
                    class="publication-link">Paper</a>
                </div>
                <span class="publication-year">{{ publication.date?.slice(0, 7) || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <span class="loading-text">Loading publications...</span>
          </div>

          <!-- No more data indicator -->
          <div v-if="!hasMore && publications.length > 0" class="no-more-data">
            <span>No more publications to load</span>
          </div>

          <!-- Empty state -->
          <div v-if="publications.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>No publications found</h3>
            <p v-if="hasActiveFilters">Try adjusting your filters or search terms.</p>
            <p v-else>There are currently no publications available.</p>
            <button v-if="hasActiveFilters" @click="clearAllFilters" class="clear-filters-btn">
              Clear all filters
            </button>
          </div>

          <!-- Load more trigger element for intersection observer -->
          <div v-if="publications.length > 0 && hasMore" ref="loadMoreTrigger" class="load-more-trigger"></div>
        </div>
      </div>
    </section>

    <!-- Bib Modal -->
    <Teleport to="body">
      <div v-if="bibModal.show" class="bib-modal" @click="closeBibModal">
        <div class="bib-modal-content" @click.stop>
          <div class="bib-modal-header">
            <h3>{{ $t('portal.research.citation') }}</h3>
            <button class="close-btn" @click="closeBibModal">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="bib-modal-body">
            <div class="bib-content">
              <pre>{{ bibModal.content }}</pre>
            </div>
            <button class="copy-btn" @click="copyBibToClipboard">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor"
                  stroke-width="2" />
              </svg>
              {{ $t('portal.research.copyToClipboard') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
import { ref, onMounted, onUnmounted, computed, watch, onActivated, nextTick } from 'vue';
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
  name: 'PortalPublications'
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

// Publications data
const publications = ref<any[]>([])
const loading = ref<boolean>(false)
const hasMore = ref<boolean>(true)
const currentPage = ref<number>(0)
const pageSize = ref<number>(10)
const publicationListRef = ref<HTMLElement | null>(null)
const totalCount = ref<number>(0)
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)
const intersectionObserver = ref<IntersectionObserver | null>(null)

// Filter tags data with counts
const filterTags = ref([
  { id: 'all', label: 'All', count: 0 },
  { id: 'ICML', label: 'ICML', count: 0 },
  { id: 'ICLR', label: 'ICLR', count: 0 },
  { id: 'NeurIPS', label: 'NeurIPS', count: 0 },
  { id: 'ACL', label: 'ACL', count: 0 },
  { id: 'KDD', label: 'KDD', count: 0 },
  { id: 'EMNLP', label: 'EMNLP', count: 0 },
  { id: 'AAAI', label: 'AAAI', count: 0 },
  { id: 'NLPCC', label: 'NLPCC', count: 0 }
])

// Year filter tags
const yearTags = ref<FilterTag[]>([])

// Combined filter tags (conferences + years)
const allFilterTags = computed(() => {
  return [...filterTags.value, ...yearTags.value]
})

// Separate filter states for conferences and years
const activeConferenceFilter = ref<string>('all')
const activeYearFilter = ref<string>('all')

// Search state
const searchQuery = ref<string>('')

// Bib Modal State
const bibModal = ref({
  show: false,
  content: '',
  publication: null as any
})

// Computed properties
const hasActiveFilters = computed(() => {
  return activeConferenceFilter.value !== 'all' || activeYearFilter.value !== 'all' || searchQuery.value.trim() !== ''
})

// Helper functions
const getFilterLabel = (filterId: string) => {
  const tag = allFilterTags.value.find(t => t.id === filterId)
  return tag ? tag.label : filterId
}

const clearAllFilters = () => {
  setActiveConferenceFilter('all')
  setActiveYearFilter('all')
  clearSearch()
}

// Get tag counts from database (single request, client-side aggregation)
const getTagCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('meeting, date')

    if (error) {
      console.error('Error fetching meeting counts:', error)
      return
    }

    // Initialize counters
    const meetingCounts: Record<string, number> = {
      all: 0,
      ICML: 0,
      ICLR: 0,
      NeurIPS: 0,
      ACL: 0,
      KDD: 0,
      EMNLP: 0,
      AAAI: 0,
      NLPCC: 0
    }

    // Year counters
    const yearCounts: Record<string, number> = {}
    const yearsSet = new Set<string>()

    // Count occurrences
    if (data) {
      data.forEach((item: any) => {
        meetingCounts.all++

        // Count meetings
        if (item.meeting) {
          const meeting = item.meeting.toUpperCase()
          Object.keys(meetingCounts).forEach(key => {
            if (key !== 'all' && meeting.includes(key)) {
              meetingCounts[key]++
            }
          })
        }

        // Collect years
        if (item.date) {
          const year = item.date.substring(0, 4)
          yearsSet.add(year)
          yearCounts[year] = (yearCounts[year] || 0) + 1
        }
      })
    }

    // Update filter tags with counts
    filterTags.value = filterTags.value.map(tag => ({
      ...tag,
      count: meetingCounts[tag.id] || 0
    }))

    // Generate year tags from collected years, sorted in descending order
    const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
    yearTags.value = sortedYears.map(year => ({
      id: year,
      label: year,
      count: yearCounts[year] || 0
    }))
  } catch (error) {
    console.error('Error in getTagCounts:', error)
  }
}

// Get publications from database with improved filtering
const getPublications = async (page: number = 0, size: number = 10) => {
  try {
    loading.value = true

    const from = page * size
    const to = from + size - 1

    let query = supabase
      .from('publications')
      .select('*')
      .order('date', { ascending: false })

    // Apply conference filter if not 'all'
    if (activeConferenceFilter.value !== 'all') {
      query = query.ilike('meeting', `%${activeConferenceFilter.value}%`)
    }

    // Apply year filter if not 'all'
    if (activeYearFilter.value !== 'all') {
      query = query.ilike('date', `${activeYearFilter.value}%`)
    }

    // Apply search filter - search across multiple fields
    if (searchQuery.value.trim()) {
      const searchTerm = searchQuery.value.trim()
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,booktitle.ilike.%${searchTerm}%`)
    }

    // Apply pagination
    query = query.range(from, to)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching publications:', error)
      return []
    }

    // Check if there are more publications
    if (!data || data.length < size) {
      hasMore.value = false
    }

    return data || []
  } catch (error) {
    console.error('Error in getPublications:', error)
    return []
  } finally {
    loading.value = false
  }
}

// Load more publications
const loadMorePublications = async () => {
  if (loading.value || !hasMore.value) return

  currentPage.value++
  const newPublications = await getPublications(currentPage.value, pageSize.value)

  if (newPublications.length > 0) {
    publications.value.push(...newPublications)
  }
}

// Initial load
const loadInitialPublications = async () => {
  currentPage.value = 0
  hasMore.value = true
  publications.value = []

  const initialData = await getPublications(0, pageSize.value)
  publications.value = initialData
}

// Set active conference filter function
const setActiveConferenceFilter = async (filterId: string) => {
  if (activeConferenceFilter.value === filterId) return

  activeConferenceFilter.value = filterId
  await loadInitialPublications()
}

// Set active year filter function
const setActiveYearFilter = async (filterId: string) => {
  if (activeYearFilter.value === filterId) return

  activeYearFilter.value = filterId
  await loadInitialPublications()
}

// Search functions with debounce
const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(async () => {
    await loadInitialPublications()
  }, 500) // 500ms debounce
}

// 处理回车键搜索
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    loadInitialPublications()
  }
}

const handleSearch = async () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  await loadInitialPublications()
}

const clearSearch = async () => {
  searchQuery.value = ''
  await loadInitialPublications()
}

// Show Bib Modal
const showBibModal = (publication: any) => {
  if (publication.bib) {
    bibModal.value.show = true
    bibModal.value.content = publication.bib
    bibModal.value.publication = publication
  } else {
    message.warning('BibTeX citation not available for this publication.')
  }
}

// Close Bib Modal
const closeBibModal = () => {
  bibModal.value.show = false
}

// Copy bib to clipboard
const copyBibToClipboard = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(bibModal.value.content)
      message.success('BibTeX citation copied to clipboard!')
    } else {
      fallbackCopyTextToClipboard(bibModal.value.content)
    }
  } catch (error) {
    console.error('Failed to copy:', error)
    fallbackCopyTextToClipboard(bibModal.value.content)
  }
}

// 备用复制函数
const fallbackCopyTextToClipboard = (text: string) => {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // 避免在页面上显示
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      message.success('BibTeX citation copied to clipboard!')
    } else {
      showBibTextModal(text)
    }
  } catch (error) {
    console.error('Fallback copy failed:', error)
    showBibTextModal(text)
  }
}

// 显示BibTeX文本的模态框
const showBibTextModal = (bibText: string) => {
  // 创建一个简单的模态框显示BibTeX内容
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `

  const content = document.createElement('div')
  content.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    position: relative;
  `

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '×'
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `

  const title = document.createElement('h3')
  title.textContent = 'BibTeX Citation'
  title.style.marginBottom = '15px'

  const textarea = document.createElement('textarea')
  textarea.value = bibText
  textarea.style.cssText = `
    width: 100%;
    height: 200px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    resize: vertical;
  `
  textarea.readOnly = true

  const copyBtn = document.createElement('button')
  copyBtn.textContent = 'Select All'
  copyBtn.style.cssText = `
    margin-top: 10px;
    padding: 8px 16px;
    background: #c8bbf1;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  `

  copyBtn.onclick = () => {
    textarea.select()
    textarea.setSelectionRange(0, 99999) // For mobile devices
    message.info('Text selected. Please use Ctrl+C (or Cmd+C) to copy.')
  }

  closeBtn.onclick = () => {
    document.body.removeChild(modal)
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  }

  content.appendChild(closeBtn)
  content.appendChild(title)
  content.appendChild(textarea)
  content.appendChild(copyBtn)
  modal.appendChild(content)
  document.body.appendChild(modal)

  // 自动选中文本
  setTimeout(() => {
    textarea.select()
  }, 100)
}

// Handle image load errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Image Preview State
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

// ESC key handler for image preview and bib modal
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (imagePreview.value.show) {
      closeImagePreview()
    }
    if (bibModal.value.show) {
      closeBibModal()
    }
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
  // Clean up existing observer
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }

  // Create new observer
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const target = entries[0]
      if (target.isIntersecting && !loading.value && hasMore.value) {
        loadMorePublications()
      }
    },
    {
      root: null,
      rootMargin: '200px', // Load before reaching the bottom
      threshold: 0.1
    }
  )

  // Observe the trigger element
  if (loadMoreTrigger.value) {
    intersectionObserver.value.observe(loadMoreTrigger.value)
  }
}

// Watch for loadMoreTrigger changes
watch(loadMoreTrigger, (newTrigger) => {
  if (newTrigger && intersectionObserver.value) {
    intersectionObserver.value.observe(newTrigger)
  }
})

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
  await loadInitialPublications()

  // Setup intersection observer
  await nextTick()
  setupIntersectionObserver()

  // Add ESC key listener
  document.addEventListener('keydown', handleEscKey)
})

onActivated(async () => {
  console.log("onActivated")
  await loadInitialPublications()
})

// 监听路由变化，当进入当前页面时重新获取数据
watch(() => route.name, async (newRouteName) => {
  console.log("路由变化:", newRouteName)
  if (newRouteName === 'portal_publications') {
    console.log("进入publications页面，重新获取数据")
    await loadInitialPublications()
  }
}, { immediate: false })

onUnmounted(() => {
  // Disconnect intersection observer
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }

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

.header {
  background: #c8bbf1;
  border-bottom: none;
}

.publications-page {
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}

/* Hero Section */
.hero {
  padding: 5rem 0 4.375rem 0;
  background: #c8bbf1;
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

/* Publications Section */
.publications {
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

.count-badge {
  font-size: 1.5rem;
  color: #666666;
  font-weight: 400;
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

/* Filter Section */
.filter-section {
  margin-bottom: 3.75rem;
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-group-title {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
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
  padding: 0.5rem 1rem;
  border-radius: 3.125rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 0.125rem solid transparent;
  background: #ffffff;
  color: #666666;
  position: relative;
  overflow: hidden;
  min-width: 4.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-count {
  font-size: 0.875rem;
  color: #999999;
  font-weight: 400;
}

.filter-tag.active .tag-count {
  color: #000000;
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
  border-color: #c8bbf1;
  color: #000000;
}

.filter-tag:hover::before {
  left: 100%;
}

.filter-tag.active {
  background: #c8bbf1;
  color: #000000;
  border-color: #c8bbf1;
  transform: translateY(-2px);
}

.filter-tag.active::before {
  display: none;
}

.filter-tag:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
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

/* Publication Tags */
.publication-tags {
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

.tag-icml {
  background: #e3f2fd;
  color: #1565c0;
}

.tag-iclr {
  background: #f3e5f5;
  color: #7b1fa2;
}

.tag-neurips {
  background: #fff3e0;
  color: #ef6c00;
}

.tag-acl {
  background: #ffebee;
  color: #c62828;
}

.tag-kdd {
  background: #e8f5e8;
  color: #2e7d32;
}

.tag-emnlp {
  background: #fce4ec;
  color: #ad1457;
}

.tag-aaai {
  background: #e1f5fe;
  color: #0277bd;
}

.tag-nlpcc {
  background: #f1f8e9;
  color: #558b2f;
}

.tag-year {
  background: #e8f5e8;
  color: #2e7d32;
}

.tag-conference {
  background: #fff8e1;
  color: #f57c00;
}

.tag-default {
  background: #f5f5f5;
  color: #666666;
}

/* Publication List */
.publication-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.publication-item {
  display: grid;
  grid-template-columns: 20rem 1fr;
  gap: 2.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 2.5rem;
  align-items: start;
}

.publication-item:last-child {
  border-bottom: none;
}

.publication-image {
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

.publication-image:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.publication-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.publication-image:hover img {
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

.publication-image:hover .image-overlay {
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

.publication-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.publication-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.375rem;
  color: #000000;
  margin: 0;
  line-height: 1.4;
}

.publication-author {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  color: #666666;
  margin: 0;
  font-style: italic;
}

.publication-description {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.125rem;
  color: #666666;
  line-height: 1.6;
  margin: 0;
}

.publication-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.75rem;
}

.publication-link {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: #000000;
  text-decoration: underline;
  transition: color 0.3s ease;
  cursor: pointer;
}

.publication-link:hover {
  color: #666666;
}

.publication-year {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #666666;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.75rem 1.25rem;
  gap: 1.25rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid #f0f0f0;
  border-top: 0.25rem solid #c8bbf1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  color: #666666;
}

.no-more-data {
  display: flex;
  justify-content: center;
  padding: 2.5rem 1.25rem;
  color: #999999;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 1.25rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6.25rem 1.25rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  color: #000000;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #666666;
  margin: 0 0 1.5rem 0;
}

.clear-filters-btn {
  background: #c8bbf1;
  color: #000000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5625rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #c9f527;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(215, 255, 57, 0.3);
}

/* Load More Trigger */
.load-more-trigger {
  height: 0.0625rem;
  width: 100%;
}

/* Bib Modal */
.bib-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1.25rem;
}

.bib-modal-content {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 0.625rem 2.5rem rgba(0, 0, 0, 0.3);
  max-width: 50rem;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bib-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  border-bottom: 0.125rem solid #e0e0e0;
}

.bib-modal-header h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.bib-modal-body {
  padding: 1.75rem;
  overflow-y: auto;
  flex: 1;
}

.bib-content {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  max-height: 25rem;
  overflow-y: auto;
}

.bib-content pre {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #000000;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #000000;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: 'Sora', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #333333;
  transform: translateY(-1px);
}

.copy-btn svg {
  width: 1rem;
  height: 1rem;
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

/* Responsive Design */
@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }

  .hero-title {
    font-size: 50px;
  }

  .hero-description {
    font-size: 20px;
  }

  .section-title {
    font-size: 40px;
  }

  .publication-item {
    grid-template-columns: 220px 1fr;
    gap: 30px;
  }

  .publication-image {
    width: 220px;
    height: 165px;
  }

  .publication-title {
    font-size: 22px;
  }

  .publication-description {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 90%;
    padding: 0 1rem;
  }

  .hero {
    padding: 3.75rem 0;
  }

  .hero-title {
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

  .section-title {
    font-size: 1.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .publications {
    padding: 3rem 0;
  }

  /* Mobile image preview adjustments */
  .image-preview-container {
    max-width: 95%;
    max-height: 95vh;
    margin: 0 10px;
  }

  .image-preview-header {
    padding: 12px 16px;
  }

  .image-preview-title {
    font-size: 18px;
  }

  .image-preview-content {
    padding: 16px;
    max-height: calc(95vh - 60px);
  }

  .preview-icon {
    width: 30px;
    height: 30px;
    margin-bottom: 6px;
  }

  .image-overlay span {
    font-size: 12px;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .filter-group {
    margin-bottom: 24px;
  }

  .filter-group-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .filter-tags {
    gap: 8px;
    margin-bottom: 16px;
  }

  .filter-tag {
    font-size: 14px;
    padding: 10px 20px;
    min-width: 70px;
  }

  .publication-list {
    gap: 30px;
  }

  .publication-item {
    grid-template-columns: 1fr;
    gap: 20px;
    padding-bottom: 30px;
  }

  .publication-image {
    width: 100%;
    height: 200px;
    max-width: 400px;
    margin: 0 auto;
  }

  .publication-title {
    font-size: 19px;
    margin-bottom: 12px;
  }

  .publication-description {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .publication-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .publication-link {
    font-size: 16px;
  }

  .publication-year {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .container {
    max-width: 95%;
    padding: 0 0.75rem;
  }

  .hero {
    padding: 2.5rem 0;
  }

  .hero-title {
    font-size: 1.75rem;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .publications {
    padding: 2rem 0;
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

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-group-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .filter-tag {
    font-size: 12px;
    padding: 8px 16px;
    min-width: 60px;
  }

  .tag-count {
    font-size: 12px;
  }

  /* Bib Modal Mobile Styles */
  .bib-modal-content {
    max-width: 95%;
    max-height: 90vh;
  }

  .bib-modal-header {
    padding: 16px 20px;
  }

  .bib-modal-header h3 {
    font-size: 18px;
  }

  .bib-modal-body {
    padding: 20px;
  }

  .bib-content {
    padding: 16px;
    max-height: 300px;
  }

  .bib-content pre {
    font-size: 12px;
  }

  .copy-btn {
    font-size: 14px;
    padding: 10px 14px;
  }

  .publication-list {
    gap: 24px;
  }

  .publication-item {
    padding-bottom: 24px;
    gap: 16px;
  }

  .publication-image {
    height: 160px;
  }

  .publication-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .publication-description {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .publication-link {
    font-size: 14px;
  }

  .publication-year {
    font-size: 14px;
  }

  .empty-state {
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 22px;
  }

  .empty-state p {
    font-size: 16px;
  }

  /* Small screen image preview adjustments */
  .image-preview-container {
    max-width: 98%;
    max-height: 98vh;
    margin: 0 4px;
    border-radius: 8px;
  }

  .image-preview-header {
    padding: 10px 12px;
  }

  .image-preview-title {
    font-size: 16px;
  }

  .image-preview-content {
    padding: 12px;
    max-height: calc(98vh - 50px);
  }

  .close-btn {
    padding: 6px;
  }

  .close-btn svg {
    width: 18px;
    height: 18px;
  }

  .preview-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }

  .image-overlay span {
    font-size: 10px;
  }
}
</style>