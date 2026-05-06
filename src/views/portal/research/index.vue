<template>
  <div class="research-page" :class="{ 'is-dark': isDark }">
    <!-- Navigation Header -->
    <Header />

    <!-- Hero Section (aligned with About page) -->
    <section class="header-section">
      <div class="container">
        <Motion as="h1" class="main-title" :initial="{ opacity: 0, y: 50 }" :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }">
          {{ $t('portal.research.title') }}
        </Motion>
        <Motion as="p" class="main-description" :initial="{ opacity: 0, y: 30 }" :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2, duration: 0.8, ease: 'easeOut' }">
          <span class="typewriter-text" v-if="localizedResearchDescription">
            {{ animatedDescription }}
          </span>
        </Motion>

        <!-- Research Visualization -->
        <!-- <div class="research-viz">
          <div class="dots-grid">
            <div 
              v-for="(dot, index) in dots" 
              :key="index"
              class="dot"
              :class="dot.type"
            ></div>
          </div>
          <div class="connection-lines">
            <svg class="connections" viewBox="0 0 1180 306">
              <line x1="200" y1="150" x2="400" y2="100" stroke="#000" stroke-width="2"/>
              <line x1="400" y1="100" x2="600" y2="150" stroke="#000" stroke-width="2"/>
              <line x1="600" y1="150" x2="800" y2="100" stroke="#000" stroke-width="2"/>
              <line x1="800" y1="100" x2="1000" y2="150" stroke="#000" stroke-width="2"/>
            </svg>
          </div>
        </div> -->
      </div>
    </section>

    <!-- Blog Section -->
    <section id="blog" class="blog-section">
      <div class="container">
        <div class="section-header-with-link">
          <h2 class="section-title">{{ $t('portal.blog.title') }}</h2>
          <button class="read-more-link" @click="navTo('/portal/blog')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Blog List -->
        <div class="blog-list">
          <div class="blog-item" v-for="blog in limitedBlogs" :key="blog.id">
            <!-- Blog Content -->
            <div class="blog-content">
              <h3 class="blog-title" @click="navigateToBlogDetail(blog)">{{ blog.title || 'Untitled' }}</h3>
              <p class="blog-description" v-if="blog.introducing" v-html="blog.introducing"></p>

              <div class="blog-meta">
                <div class="blog-info">
                  <span v-if="blog.publish_time" class="blog-date">{{ formatBlogDate(blog.publish_time) }}</span>
                  <span v-if="blog.readtime" class="blog-read-time">• {{ blog.readtime }} min</span>
                </div>
              </div>
              <!-- Tags display -->
              <div class="blog-tags" v-if="blog.tags || blog.publish_time">
                <!-- <span v-if="blog.publish_time" :key="'year-' + blog.publish_time" class="blog-read-time">
                  #{{ blog.publish_time.slice(0, 4) }}
                </span>

                <span v-for="(tag, index) in blog.tags ? blog.tags.split(',').slice(0, 2) : []" :key="index"
                  class="blog-read-time">
                  #{{ tag.trim() }}
                </span> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Read More Button for Mobile -->
        <div class="section-bottom-link">
          <button class="read-more-link-bottom" @click="navTo('/portal/blog')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="projects">
      <div class="container">
        <div class="section-header-with-link">
          <h2 class="section-title">{{ $t('portal.research.project') }}</h2>
          <button class="read-more-link" @click="navTo('/portal/project')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Project 1 -->
        <div class="project-item" v-for="project in limitedProjects" :key="project.id">
          <div class="project-content">
            <h3 class="project-title">{{ getLocalizedProjectTitle(project) }}</h3>
            <div class="project-description" v-html="getLocalizedProjectDescription(project)">

            </div>
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

        <!-- Read More Button for Mobile -->
        <div class="section-bottom-link">
          <button class="read-more-link-bottom" @click="navTo('/portal/project')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Publications Section -->
    <section id="publications" class="publications">
      <div class="container">
        <div class="section-header-with-link">
          <h2 class="section-title">
            {{ $t('portal.publications.title') }}
          </h2>
          <button class="read-more-link" @click="navTo('/portal/publications')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Publication List -->
        <div class="publication-list" ref="publicationListRef">
          <div class="publication-item" v-for="publication in limitedPublications" :key="publication.id">
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
              <div class="publication-meta">
                <div class="publication-links">
                  <a href="#" class="publication-link" @click.prevent="showBibModal(publication)">Bib</a>
                  <a v-if="publication.code_url" style="margin-left: 0.625rem;" :href="publication.code_url"
                    target="_blank" class="publication-link">Code</a>
                  <a v-if="publication.link_url" style="margin-left: 0.625rem;" :href="publication.link_url"
                    target="_blank" class="publication-link">Paper</a>
                </div>
                <span class="publication-year">{{ publication.date?.slice(0, 7) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Read More Button for Mobile -->
        <div class="section-bottom-link">
          <button class="read-more-link-bottom" @click="navTo('/portal/publications')">
            {{ $t('portal.home.readAll') }}
            <svg class="arrow-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
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
import { ref, onMounted, onUnmounted, computed, watch, onActivated, nextTick } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { Motion } from "motion-v"
// @ts-ignore
import Header from '../components/Header.vue';
// @ts-ignore
import Footer from '../components/Footer.vue';
// @ts-ignore
import BackToTop from '../components/BackToTop.vue';
import { useRouter, useRoute } from 'vue-router';
import supabase from '@/supabase/supabase';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { useSeo } from '@/composables/useSeo';

defineOptions({
  name: 'PortalResearch'
})

useSeo({
  title: 'Research',
  description: 'GenSI Lab research directions including memory, abstract modeling, induction, reasoning, and autonomous agents.',
  keywords: 'GenSI, research, AI research, memory, reasoning, autonomous agents',
})

const message = useMessage();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// Define dot type interface
interface DotType {
  type: string
}

// Generate dots for visualization
const dots = ref<DotType[]>([])

// Publications data
const publications = ref<any[]>([])
const loading = ref<boolean>(false)
const publicationListRef = ref<HTMLElement | null>(null)
const totalCount = ref<number>(0)
const searchTimeout = ref<NodeJS.Timeout | null>(null)


// Bib Modal State
const bibModal = ref({
  show: false,
  content: '',
  publication: null as any
})

// Image error handler
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
}

// Get publications from database (only first 5 for research page)
const getPublications = async () => {
  try {
    loading.value = true

    let query = supabase
      .from('publications')
      .select('*')
      .order('year', { ascending: false, nullsFirst: false })
      .order('sort', { ascending: false, nullsFirst: false })
      .order('date', { ascending: false, nullsFirst: false })
      .limit(5)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching publications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPublications:', error)
    return []
  } finally {
    loading.value = false
  }
}

// Load publications
const loadPublications = async () => {
  publications.value = await getPublications()
}


// Bib Modal functions
const generateBibTeX = (publication: any) => {
  const cleanTitle = publication.title?.replace(/[{}]/g, '') || 'Unknown Title'
  const cleanAuthor = publication.author?.replace(/[{}]/g, '') || 'Unknown Author'
  const year = publication.date ? publication.date.slice(0, 4) : 'Unknown Year'
  const booktitle = publication.booktitle || publication.meeting || 'Unknown Conference'

  // Generate a key from the first author's last name and year
  const firstAuthor = cleanAuthor.split(',')[0].split(' ').pop() || 'unknown'
  const key = `${firstAuthor.toLowerCase()}${year}`

  return `@inproceedings{${key},
  title={${cleanTitle}},
  author={${cleanAuthor?.replaceAll(", ", " and ")}}
  booktitle={${booktitle}},
  year={${year}}
}`
}

const showBibModal = (publication: any) => {
  bibModal.value.publication = publication
  bibModal.value.content = generateBibTeX(publication)
  bibModal.value.show = true
}

const closeBibModal = () => {
  bibModal.value.show = false
  bibModal.value.content = ''
  bibModal.value.publication = null
}

const copyBibToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(bibModal.value.content)
    message.success('Citation copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy text: ', error)
    message.error('Failed to copy citation')
  }
}

// Simple icon component as a string
const Icon = ({ name }: { name: string }) => name

const projects = ref<any[]>([])
const blogs = ref<any[]>([])

// Computed properties to limit data
const limitedProjects = computed(() => {
  return projects.value.slice(0, 5)
})

const limitedPublications = computed(() => {
  return publications.value.slice(0, 5)
})

const limitedBlogs = computed(() => {
  return blogs.value.slice(0, 5)
})

const getProjects = async () => {
  const { data, error } = await supabase.from('project').select('*').order('sort', { ascending: true })
  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  return data || []
}

const getBlogs = async () => {
  const { data, error } = await supabase
    .from('gensiblog')
    .select('*')
    .eq('isshow', 1)
    .order('publish_time', { ascending: false })
    .limit(5)
  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
  return data || []
}

// ESC key handler for image preview
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && imagePreview.value.show) {
    closeImagePreview()
  }
}

const descriptionData = ref<any>({});

// 基于语言的本地化描述（research/research_cn）
const localizedResearchDescription = computed(() => {
  const isZhCN = appStore.locale === 'zh-CN';
  const data = descriptionData.value || {};
  return isZhCN ? (data.research_cn || data.research || '') : (data.research || data.research_cn || '');
});

// 打字机效果变量
const animatedDescription = ref('');
let typewriterTimer: NodeJS.Timeout | null = null;

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
  }, 45); // 适中的速度
}

// 监听本地化后的描述变化
watch(localizedResearchDescription, (newValue) => {
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

// 标签页恢复后的数据刷新（研究页）
async function refreshResearchData() {
  try {
    await loadPublications();
    projects.value = await getProjects();
    blogs.value = await getBlogs();
    descriptionData.value = await getDescription();
  } catch (err) {
    console.error('Failed to refresh research data after visibility/focus:', err);
  }
}

function handleResearchVisibilityChange() {
  if (document.visibilityState === 'visible') {
    refreshResearchData();
  }
}

function handleResearchWindowFocus() {
  refreshResearchData();
}

async function getDescription() {
  const { data, error } = await supabase.from('description').select('*').eq('id', 1).single();
  console.log(data, "description");
  return data;
}

onMounted(async () => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);

  // Generate dots grid
  const dotTypes = ['primary', 'secondary', 'accent', 'light']
  for (let i = 0; i < 120; i++) {
    dots.value.push({
      type: dotTypes[Math.floor(Math.random() * dotTypes.length)]
    })
  }

  // Load data
  projects.value = await getProjects()
  blogs.value = await getBlogs()
  descriptionData.value = await getDescription()

  // Load publications data
  await loadPublications()

  console.log(publications.value)
  console.log(projects.value)
  console.log(blogs.value)

  // Add event listeners
  document.addEventListener('keydown', handleEscKey)

  // 添加页面可见性与焦点监听，切回时重新拉取数据
  document.addEventListener('visibilitychange', handleResearchVisibilityChange)
  window.addEventListener('focus', handleResearchWindowFocus)
  window.addEventListener('pageshow', handleResearchWindowFocus)

  // 在数据加载完成后尝试根据哈希再滚动一次，避免异步内容导致偏移
  await nextTick()
  tryScrollToHash()
})

// 监听路由变化，当进入当前页面时重新获取数据
watch(() => route.name, async (newRouteName) => {
  console.log("路由变化:", newRouteName)
  if (newRouteName === 'portal_research') {
    console.log("进入research页面，重新获取数据")
    await loadPublications()
    projects.value = await getProjects()
    blogs.value = await getBlogs()
    descriptionData.value = await getDescription()
    await nextTick()
    tryScrollToHash()
  }
}, { immediate: false })

// 监听 hash 变化，进入锚点时进行滚动，处理从其他页面带 hash 进入的场景
watch(() => route.hash, async (newHash, oldHash) => {
  if (newHash && route.name === 'portal_research') {
    await nextTick()
    tryScrollToHash()
  }
})

/**
 * 尝试滚动到路由 hash 指定的元素，带有重试机制，避免异步内容加载导致位置未稳定
 */
function tryScrollToHash(maxAttempts: number = 6) {
  const hash = route.hash
  if (!hash) return

  let attempt = 0
  const performScroll = () => {
    const el = document.querySelector<HTMLElement>(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (attempt < maxAttempts) {
      attempt += 1
      // 渐进式延迟重试
      setTimeout(performScroll, 100 * attempt)
    }
  }

  performScroll()
}

onUnmounted(() => {
  // Remove ESC key listener
  document.removeEventListener('keydown', handleEscKey)

  // 清理打字机定时器
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }

  // 移除可见性/焦点监听器
  document.removeEventListener('visibilitychange', handleResearchVisibilityChange)
  window.removeEventListener('focus', handleResearchWindowFocus)
  window.removeEventListener('pageshow', handleResearchWindowFocus)

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

function navTo(url: string) {
  router.push(url);
}

function toNewTab(url: string) {
  if (!url) return;
  window.open(url, '_blank');
}

// Image Preview State
const imagePreview = ref({
  show: false,
  src: '',
  title: ''
})

const openImagePreview = (src: string, title: string) => {
  imagePreview.value.src = src
  imagePreview.value.title = title
  imagePreview.value.show = true
}

const closeImagePreview = () => {
  imagePreview.value.show = false
}

// 根据当前语言获取项目标题的辅助函数
function getLocalizedProjectTitle(project: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (project.title_cn || project.title)
    : (project.title || project.title_cn);
}

// 根据当前语言获取项目描述的辅助函数
function getLocalizedProjectDescription(project: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (project.content_cn || project.description)
    : (project.description || project.content_cn);
}

// 格式化博客日期的辅助函数
function formatBlogDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// 导航到博客详情页
function navigateToBlogDetail(blog: any) {
  if (blog.routename) {
    router.push({ name: 'portal_blogdetail', params: { id: blog.routename } })
  } else if (blog.id) {
    router.push({ name: 'portal_blogdetail', params: { id: blog.id } })
  }
}
</script>

<style scoped>
@import '../assests/common.css';

.header {
  background: #c8bbf1;
  border-bottom: none;
}

.header.is-dark {
  background: #1e1e1e !important;
}
/* 打字机效果样式 */
.typewriter-text {
  position: relative;
}

.typewriter-text::after {
  content: '|';
  color: #000;
  font-weight: bold;
  animation: blink 1s infinite;
  margin-left: 0.125rem;
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* 当打字机完成后隐藏光标 */
.typewriter-text.completed::after {
  display: none;
}

.publication-item:last-child {
  border-bottom: none;
}

.project-item:last-child {
  border-bottom: none;
}

.research-page {
  min-height: 100vh;
  background: #ffffff;
}

.container {
  max-width: 65%;
  margin: 0 auto;
  padding: 0 1.25rem;
}



.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.logo-icon {
  width: 2.25rem;
  height: 2.5rem;
}

.logo-text {
  width: 2.875rem;
  height: 0.75rem;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #000000;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.active {
  border-bottom: 0.125rem solid #000000;
  padding-bottom: 0.25rem;
}

.nav-link.contact {
  font-weight: 700;
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
  max-width: 53.5625rem;
  margin: 0;
  line-height: 2rem;
  font-weight: 400;
}

.research-viz {
  position: relative;
  height: 19.125rem;
  margin-bottom: 2.5rem;
}

.dots-grid {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 0.75rem;
  height: 100%;
}

.dot {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #d7ff39;
}

.dot.primary {
  background: #d7ff39;
}

.dot.secondary {
  background: #7bd8f4;
}

.dot.accent {
  background: #ffffff;
  border: 0.125rem solid #e0e0e0;
}

.dot.light {
  background: #f0f0f0;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Projects Section */
.projects {
  padding: 1rem 0;
  background: #f0f0f0;
  scroll-margin-top: 6.25rem;
}

.section-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 2.25rem;
  color: #000000;
  margin-bottom: 2.5rem;
}

.section-header-with-link .section-title {
  margin-bottom: 0;
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
  /* -webkit-line-clamp: 4;
  line-clamp: 4; */
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

.project-links {
  display: flex;
  gap: 2.5rem;
  margin-top: 1.25rem;
}

.project-link {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  text-decoration: underline;
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
  margin: auto 0
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
  /* Allow clicks to pass through to the image */
}

.project-image:hover .image-overlay {
  opacity: 1;
  pointer-events: auto;
  /* Allow clicks to pass through to the overlay */
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


/* Section Header with Link */
.section-header-with-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.read-more-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: #000000;
  text-decoration: underline;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.read-more-link:hover {
  color: #666666;
  transform: translateX(4px);
}

.read-more-link .arrow-icon {
  transition: transform 0.3s ease;
}

.read-more-link:hover .arrow-icon {
  transform: translateX(4px);
}

/* Section Bottom Link (for mobile) */
.section-bottom-link {
  display: none;
  margin-top: 2rem;
}

.read-more-link-bottom {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: #000000;
  text-decoration: underline;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.read-more-link-bottom:hover {
  color: #666666;
  transform: translateX(4px);
}

.read-more-link-bottom .arrow-icon {
  transition: transform 0.3s ease;
}

.read-more-link-bottom:hover .arrow-icon {
  transform: translateX(4px);
}

/* Publications Section */
.publications {
  background: #f0f0f0;
  scroll-margin-top: 6.25rem;
  padding: 3.75rem 0;
}


.publication-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.publication-item {
  display: grid;
  grid-template-columns: 17.5rem 1fr;
  gap: 2.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 2.5rem;
  align-items: start;
}

.publication-image {
  width: 17.5rem;
  height: 13.125rem;
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
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.publication-image:hover .image-overlay {
  opacity: 1;
}

.preview-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
}

.publication-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.publication-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  color: #000000;
  margin-bottom: 1rem;
  line-height: 1.4;
}

/* 移除 >768px 桌面断点样式，改由 rem 无级缩放处理 */

.publication-description {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.5rem;
  color: #000000;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.publication-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publication-link {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: #000000;
  text-decoration: underline;
}

.publication-year {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  color: #666666;
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

.tag-year {
  background: #e8f5e8;
  color: #2e7d32;
}

.tag-conference {
  background: #fff8e1;
  color: #f57c00;
}

.publication-author {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  color: #666666;
  font-style: italic;
  margin: 0;
}


/* Bib Modal */
.bib-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
}

.bib-modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.bib-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.bib-modal-header h3 {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.bib-modal-body {
  padding: 1.5rem;
}

.bib-content {
  background: #f8f8f8;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  max-height: 18.75rem;
  overflow-y: auto;
}

.bib-content pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #333333;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #000000;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: 'Sora', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: #333333;
  transform: translateY(-1px);
}

.copy-btn svg {
  flex-shrink: 0;
}

/* Blog Section */
.blog-section {
  padding: 3.75rem 0;
  background: #f0f0f0;
  scroll-margin-top: 6.25rem;
}

.blog-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.blog-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
  align-items: start;
}

.blog-item:last-child {
  border-bottom: none;
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

/* Footer */
.menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.menu-grid a {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: #000000;
  text-decoration: none;
  transition: opacity 0.3s;
}

.menu-grid a:hover {
  opacity: 0.7;
}



.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 2rem;
  height: 2rem;
  background: #000000;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: #333333;
  transform: translateY(-2px);
}


@media (max-width: 768px) {
  .container {
    max-width: 95%;
    padding: 0 16px;
  }

  .main-title {
    font-size: 36px;
    margin-bottom: 16px;
  }

  .main-description {
    font-size: 16px;
  }

  .section-title {
    font-size: 28px;
    margin-bottom: 40px;
  }

  .section-header-with-link .section-title {
    margin-bottom: 0;
  }

  .projects {
    padding: 60px 0;
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
    /* -webkit-line-clamp: 4;
    line-clamp: 4; */
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
    font-size: 20px;
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

  /* Blog Section mobile styles */
  .blog-section {
    padding: 60px 0;
  }

  .blog-list {
    gap: 30px;
  }

  .blog-item {
    padding-bottom: 30px;
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

  .section-header-with-link {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 30px;
  }

  .section-title {
    margin: 0;
    line-height: 1;
  }

  .section-header-with-link .read-more-link {
    font-size: 16px;
    flex-shrink: 0;
  }

  .section-bottom-link {
    display: none;
  }

  .read-more-link-bottom {
    font-size: 16px;
  }

  /* Research visualization adjustments for mobile */
  .research-viz {
    height: 180px;
    margin-bottom: 30px;
    padding: 0 16px;
  }

  .dots-grid {
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 6px;
    max-width: 500px;
    margin: 0 auto;
  }

  .dot {
    width: 18px;
    height: 18px;
  }

  .connections {
    display: none;
  }
}

@media (max-width: 480px) {
  .container {
    max-width: 98%;
    padding: 0 12px;
  }

  .header-section {
    padding: 40px 0 60px;
  }

  .main-title {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .main-description {
    font-size: 14px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .section-header-with-link .section-title {
    margin-bottom: 0;
  }

  .projects {
    padding: 40px 0;
  }

  .publications {
    padding: 40px 0;
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
    /* -webkit-line-clamp: 4;
    line-clamp: 4; */
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

  .btn {
    padding: 14px 28px;
    font-size: 14px;
    margin-top: 16px;
    align-self: flex-start;
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

  /* Blog Section small screen styles */
  .blog-section {
    padding: 40px 0;
  }

  .blog-list {
    gap: 24px;
  }

  .blog-item {
    padding-bottom: 24px;
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

  .section-header-with-link {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .section-title {
    margin: 0;
    line-height: 1;
  }

  .section-header-with-link .read-more-link {
    font-size: 14px;
    flex-shrink: 0;
  }

  .section-bottom-link {
    display: none;
  }

  .read-more-link-bottom {
    font-size: 14px;
  }

  /* Further reduce research visualization for very small screens */
  .research-viz {
    height: auto;
    margin-bottom: 20px;
    padding: 0 12px;
  }

  .dots-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 4px;
    max-width: 300px;
    margin: 0 auto;
  }

  .dot {
    width: 14px;
    height: 14px;
  }

  /* Small screen image preview adjustments */
  .image-preview-container {
    width: 98%;
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

/* Ensure better image display on mobile */
@media (max-width: 768px) {
  .header-section .container {
    max-width: 100%;
  }

  .project-image img {
    object-fit: cover;
    object-position: center;
    border-radius: 12px;
  }

  .project-image:hover img {
    transform: none;
  }

  /* Mobile styles for image preview */
  .image-preview-container {
    width: 95%;
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

/* ========== Dark Mode Styles ========== */
.research-page.is-dark {
  background: #121212;
}

.research-page.is-dark .header-section {
  background: #1e1e1e;
}

.research-page.is-dark .main-title {
  color: #e0e0e0;
}

.research-page.is-dark .main-description {
  color: #e0e0e0;
}

.research-page.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.research-page.is-dark .section-title {
  color: #e0e0e0;
}

.research-page.is-dark .projects {
  background: #1a1a1a;
}

.research-page.is-dark .project-title {
  color: #e0e0e0;
}

.research-page.is-dark .project-description,
.research-page.is-dark .project-description :deep(*) {
  color: #ccc !important;
}

.research-page.is-dark .project-item {
  border-bottom-color: #444;
}

.research-page.is-dark .project-image {
  background: #2a2a2a;
}

.research-page.is-dark .btn-news {
  background: #e0e0e0;
  color: #1a1a1a;
}

.research-page.is-dark .btn-news:hover {
  background: #9ee8ff;
  color: #1a1a1a;
}

.research-page.is-dark .btn-news::after {
  background: #e0e0e0;
}

.research-page.is-dark .read-more-link {
  color: #e0e0e0;
}

.research-page.is-dark .read-more-link:hover {
  color: #9ee8ff;
}

.research-page.is-dark .read-more-link-bottom {
  color: #e0e0e0;
}

.research-page.is-dark .read-more-link-bottom:hover {
  color: #9ee8ff;
}

.research-page.is-dark .blog-section {
  background: #1a1a1a;
}

.research-page.is-dark .blog-title {
  color: #e0e0e0;
}

.research-page.is-dark .blog-title:hover {
  color: #9ee8ff;
}

.research-page.is-dark .blog-description,
.research-page.is-dark .blog-description :deep(*) {
  color: #ccc !important;
}

.research-page.is-dark .blog-item {
  border-bottom-color: #444;
}

.research-page.is-dark .blog-date,
.research-page.is-dark .blog-read-time {
  color: #999;
}

.research-page.is-dark .publications {
  background: #1a1a1a;
}

.research-page.is-dark .publication-item {
  border-bottom-color: #444;
}

.research-page.is-dark .publication-image {
  background: #2a2a2a;
}

.research-page.is-dark .publication-title {
  color: #e0e0e0;
}

.research-page.is-dark .publication-author {
  color: #999;
}

.research-page.is-dark .publication-link {
  color: #9ee8ff;
}

.research-page.is-dark .publication-year {
  color: #999;
}

.research-page.is-dark .tag-year {
  background: #1a3a2a;
  color: #6ecf6e;
}

.research-page.is-dark .tag-conference {
  background: #3a2a1a;
  color: #f5a623;
}

.research-page.is-dark .bib-modal-content {
  background: #1e1e1e;
}

.research-page.is-dark .bib-modal-header {
  border-bottom-color: #444;
}

.research-page.is-dark .bib-modal-header h3 {
  color: #e0e0e0;
}

.research-page.is-dark .bib-content {
  background: #2a2a2a;
}

.research-page.is-dark .bib-content pre {
  color: #e0e0e0;
}

.research-page.is-dark .close-btn:hover {
  background: #333;
}

.research-page.is-dark .close-btn svg {
  color: #999;
}

.research-page.is-dark .image-preview-container {
  background: #1e1e1e;
}

.research-page.is-dark .image-preview-header {
  background: #2a2a2a;
  border-bottom-color: #444;
}
</style>
