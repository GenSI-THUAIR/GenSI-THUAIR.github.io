<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, watch, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Motion } from "motion-v";
// @ts-ignore
import TextHighlight from '../components/TextHighlight.vue';
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
import { useSeo } from '@/composables/useSeo';
import homethinkLight from '../assests/home/homethink.png';
import homethinkDark from '../assests/home/homethink_b.png';

defineOptions({
  name: 'PortalHome'
});

useSeo({
  title: 'Home',
  description: 'GenSI Lab - Generative Social Intelligence. Exploring the frontiers of AI research in memory, reasoning, and autonomous agents.',
  keywords: 'GenSI, AI research, social intelligence, autonomous agents, reasoning',
});

// 添加组件实例标识用于调试
const componentId = Math.random().toString(36).substr(2, 9);
console.log(`PortalHome component created with ID: ${componentId}`);

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

// 图片资源常量
const imgImage21 = "http://localhost:3845/assets/fe7b77240dcdd8e5964d2c0dc379c69312712f30.png";

// 研究方向卡片数据
const researchItemsBase = [
  { textKey: 'portal.home.research.memory', class: 'memory', color: '#ffffff', border: '#e0e0e0' },
  { textKey: 'portal.home.research.abstractModeling', class: 'abstract', color: '#7bd8f4', border: '#5bc0de' },
  { textKey: 'portal.home.research.induction', class: 'induction', color: '#d7ff39', border: '#c4e033' },
  { textKey: 'portal.home.research.reasoning', class: 'reasoning', color: '#000000', border: '#333333' },
  { textKey: 'portal.home.research.autonomous', class: 'autonomous', color: '#c8bbf1', border: '#b3a5e8' }
];

// 带国际化文本的研究方向数据
const researchItems = computed(() =>
  researchItemsBase.map(item => ({
    ...item,
    text: $t(item.textKey as any)
  }))
);

// 添加 IntersectionObserver 引用用于清理
let researchObserver: IntersectionObserver | null = null;

// 页面可见性状态
const isPageVisible = ref(true);

// 页面可见性处理函数
function handleVisibilityChange() {
  isPageVisible.value = !document.hidden;
  console.log(`[${componentId}] Page visibility changed:`, isPageVisible.value);

  if (isPageVisible.value) {
    // 页面变为可见时，重新启动必要的定时器
    if (carouselData.value.length > 0) {
      startAutoPlay();
    }
  } else {
    // 页面不可见时，暂停一些操作以节省资源
    stopAutoPlay();
  }
}

// 兜底：窗口焦点/失焦时也同步暂停与恢复
function handleWindowFocus() {
  if (carouselData.value.length > 0) {
    startAutoPlay();
  }
}
function handleWindowBlur() {
  stopAutoPlay();
}

// 防抖函数用于优化 resize 处理
let resizeTimeout: NodeJS.Timeout | null = null;
function debouncedHandleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    handleResize();
  }, 300); // 300ms 防抖延迟
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









onUnmounted(() => {
  console.log(`[${componentId}] Component unmounted`);
  // 清理事件监听器
  window.removeEventListener('resize', debouncedHandleResize);
  // 清理 resize 防抖定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
  // Remove ESC key listener
  document.removeEventListener('keydown', handleEscKey);
  // 清理页面可见性监听器
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('focus', handleWindowFocus);
  window.removeEventListener('blur', handleWindowBlur);
  // 清理打字机定时器
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  // 清理 IntersectionObserver
  if (researchObserver) {
    researchObserver.disconnect();
    researchObserver = null;
  }
  // 清理轮播图定时器
  stopAutoPlay();
  // 恢复根字号，避免影响其他页面
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = originalRootFontSize;
  }
});

// 水泡布局动画数据 - 根据设备类型调整
const bubbles = ref([
  {
    id: 1,
    text: 'Genes',
    class: 'medium blue',
    delay: 0.5,
    finalPosition: { x: '35%', y: '67%' },
    mobilePosition: { x: '25%', y: '70%' },
    transition: {
      duration: 1.2,
      ease: 'linear' as const
    }
  },
  {
    id: 2,
    text: 'Proteins',
    class: 'large white',
    delay: 1.0,
    finalPosition: { x: '8%', y: '35%' },
    mobilePosition: { x: '15%', y: '45%' },
    transition: {
      duration: 1.4,
      ease: 'linear' as const
    }
  },
  {
    id: 3,
    text: 'Small<br>molecules',
    class: 'extra-large purple',
    delay: 1.5,
    finalPosition: { x: '58%', y: '35%' },
    mobilePosition: { x: '50%', y: '25%' },
    transition: {
      duration: 1.6,
      ease: 'linear' as const
    }
  },
  {
    id: 4,
    text: '',
    class: 'small pink',
    delay: 0.2,
    finalPosition: { x: '18%', y: '85%' },
    mobilePosition: { x: '10%', y: '85%' },
    transition: {
      duration: 1.0,
      ease: 'linear' as const
    }
  },
  {
    id: 5,
    text: '',
    class: 'small white',
    delay: 0.8,
    finalPosition: { x: '50%', y: '10%' },
    mobilePosition: { x: '70%', y: '15%' },
    transition: {
      duration: 1.1,
      ease: 'linear' as const
    }
  },
  {
    id: 6,
    text: '',
    class: 'small green',
    delay: 1.8,
    finalPosition: { x: '85%', y: '10%' },
    mobilePosition: { x: '85%', y: '5%' },
    transition: {
      duration: 1.3,
      ease: 'linear' as const
    }
  },
  {
    id: 7,
    text: '',
    class: 'medium black',
    delay: 1.2,
    finalPosition: { x: '28%', y: '10%' },
    mobilePosition: { x: '25%', y: '5%' },
    transition: {
      duration: 1.25,
      ease: 'linear' as const
    }
  }
]);

// 获取当前设备对应的气泡位置
function getBubblePosition(bubble: any) {
  return isMobile.value ? bubble.mobilePosition : bubble.finalPosition;
}

// 最新新闻数据
const latestNews = ref<any[]>([]);
const projectList = ref<any[]>([]);

// 轮播图数据 (slideshow)
const carouselData = ref<any[]>([]);
const carouselSlides = ref<any[]>([]);

// 根据当前语言获取本地化内容的辅助函数
function getLocalizedContent(item: any) {
  const isZhCN = appStore.locale === 'zh-CN';

  if (item.type === 'slideshow') {
    // 轮播图数据：使用slideshow表的字段
    return isZhCN
      ? (item.description_cn || item.description)
      : (item.description || item.description_cn);
  } else if (item.type === 'news') {
    // 新闻项目：优先使用轮播图描述字段
    return isZhCN
      ? (item.lbtcontent_cn || item.lbtcontent || item.content_cn || item.content)
      : (item.lbtcontent || item.lbtcontent_cn || item.content || item.content_cn);
  } else if (item.type === 'project') {
    // 项目：优先使用轮播图描述字段
    return isZhCN
      ? (item.lbtcontent_cn || item.lbtcontent || item.content_cn || item.description)
      : (item.lbtcontent || item.lbtcontent_cn || item.description || item.content_cn);
  }

  // 兜底情况
  return item.description_cn || item.description || item.lbtcontent || item.lbtcontent_cn || item.content || item.title || '';
}

// 根据当前语言获取轮播图项目主标题的辅助函数
function getLocalizedTitle(item: any) {
  const isZhCN = appStore.locale === 'zh-CN';

  if (item.type === 'slideshow') {
    // 轮播图数据：优先使用title字段，如果没有则使用description的前50个字符作为标题
    if (item.title_cn || item.title) {
      return isZhCN
        ? (item.title_cn || item.title)
        : (item.title || item.title_cn);
    } else {
      return '';
    }
  }
  return '';
}

// 根据当前语言获取轮播图项目副标题/描述的辅助函数
function getLocalizedCarouselTitle(item: any) {
  const isZhCN = appStore.locale === 'zh-CN';

  if (item.type === 'slideshow') {
    // 轮播图数据：如果有title字段，显示完整description；否则显示description的剩余部分
    const desc = isZhCN
      ? (item.description_cn || item.description)
      : (item.description || item.description_cn);

    if (item.title_cn || item.title) {
      // 有标题时，显示完整描述
      return desc || '';
    } else {
      // 没有标题时，显示完整描述内容
      return desc || '';
    }
  } else if (item.type === 'news') {
    // 新闻优先使用轮播图描述字段
    return isZhCN
      ? (item.lbtcontent_cn || item.lbtcontent || item.content_cn || item.content)
      : (item.lbtcontent || item.lbtcontent_cn || item.content || item.content_cn);
  } else if (item.type === 'project') {
    // 项目优先使用轮播图描述字段
    return isZhCN
      ? (item.lbtcontent_cn || item.lbtcontent || item.title_cn || item.title)
      : (item.lbtcontent || item.lbtcontent_cn || item.title || item.title_cn);
  }

  // 兜底情况
  return item.description_cn || item.description || item.lbtcontent || item.lbtcontent_cn || item.content || '';
}

// 根据当前语言获取项目标题的辅助函数
function getLocalizedProjectTitle(project: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (project.title_cn || project.title)
    : (project.title || project.title_cn);
}

// 根据当前语言获取关注我们内容的辅助函数
function getLocalizedFollowUsContent(item: any) {
  const isZhCN = appStore.locale === 'zh-CN';
  return isZhCN
    ? (item.content_cn || item.content)
    : (item.content || item.content_cn);
}

// Image Preview State
const imagePreview = ref({
  show: false,
  src: '',
  title: ''
});

async function getNews() {
  const { data, error } = await supabase.from('news').select('*').order('sort', { ascending: true });
  console.log(data);
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  return data;
}

async function getProject() {
  const { data, error } = await supabase.from('project').select('*').order('sort', { ascending: true }).limit(4);
  console.log(data);
  return data;
}

async function getSlideshow() {
  const { data, error } = await supabase.from('slideshow').select('*').order('sort', { ascending: false });
  console.log(data, "slideshow");
  if (error) {
    console.error('Error fetching slideshow:', error);
    return [];
  }
  return data;
}
const followUsList = ref<any[]>([]);

async function getFollowUs() {
  const { data, error } = await supabase.from('followus').select('*').order('created_at', { ascending: false });
  console.log(data, "followUs");
  return data;
}

async function getDescription() {
  const { data, error } = await supabase.from('description').select('*').eq('id', 1).single();
  console.log(data, "description");
  return data;
}

const descriptionData = ref<any>({});

// 基于语言的本地化描述（home/home_cn）
const localizedHomeDescription = computed(() => {
  const isZhCN = appStore.locale === 'zh-CN';
  const data = descriptionData.value || {};
  return isZhCN ? (data.home_cn || data.home || '') : (data.home || data.home_cn || '');
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
  }, 50); // 每50ms添加一个字符
}

// 监听本地化后的描述变化（含语言切换与数据刷新）
watch(localizedHomeDescription, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      startTypewriter(newValue);
    }, 800);
  } else {
    animatedDescription.value = '';
  }
});

// 监听语言变化，重新渲染轮播图内容
watch(() => appStore.locale, () => {
  console.log(`[${componentId}] Language changed to:`, appStore.locale);
  // 触发本地化描述重打字
  const text = localizedHomeDescription.value;
  if (text) {
    startTypewriter(text);
  } else {
    animatedDescription.value = '';
  }
}, { immediate: false });

// 数据初始化函数
async function initializeData() {

  try {
    console.log(`[${componentId}] Initializing data...`);

    const [project, slideshow, followUs, description] = await Promise.all([
      getProject(),
      getSlideshow(),
      getFollowUs(),
      getDescription()
    ]);


    console.log(project, slideshow, followUs, description, "project,slideshow,followUs,description");

    latestNews.value = [];
    projectList.value = project || [];
    followUsList.value = followUs || [];
    descriptionData.value = description || {};

    // 使用slideshow数据用于轮播图
    const slideshowData = (slideshow || []).map((item: any) => ({ ...item, type: 'slideshow' }));
    carouselData.value = slideshowData;

    // 限制轮播图最多显示9张
    carouselSlides.value = carouselData.value.slice(0, maxCarouselSlides);

    // 重置轮播图位置到第一页
    currentSlide.value = 0;

    console.log(`[${componentId}] Data initialized successfully`, {
      projects: project?.length || 0,
      slideshow: slideshow?.length || 0,
      followUs: followUs?.length || 0,
      descriptionData: description,
      carouselSlides: carouselSlides.value.length
    });
  } catch (error) {
    console.error(`[${componentId}] Error initializing data:`, error);
  }
}

// 页面初始化函数
async function initializePage() {
  // 检测设备类型
  checkMobile();

  // 监听窗口大小变化（使用防抖优化）
  window.addEventListener('resize', debouncedHandleResize);

  document.addEventListener('keydown', handleEscKey);

  // 添加页面可见性与焦点监听器
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('blur', handleWindowBlur);

  // 初始化数据
  await initializeData();
}

onMounted(async () => {
  console.log(`[${componentId}] Component mounted`);
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  await initializePage();
});

// 当使用 keep-alive 时，组件被激活时会调用此钩子
onActivated(async () => {
  console.log(`[${componentId}] Component activated, refreshing data...`);
  await initializeData();
  // 重新启动轮播图自动播放
  startAutoPlay();
});

// 监听路由变化，确保在路由切换时重新获取数据
watch(() => route.path, async (newPath, oldPath) => {
  if (newPath === '/portal_home' && newPath !== oldPath) {
    console.log(`[${componentId}] Route changed to portal_home, refreshing data...`);
    await nextTick(); // 等待DOM更新
    await initializeData();
  }
}, { immediate: false });






// 轮播图相关
const currentSlide = ref(0);
const carouselContainer = ref<HTMLElement>();
const autoPlayInterval = ref<NodeJS.Timeout>();

// 限制轮播图最多显示9张
const maxCarouselSlides = 9;

// 轮播图控制函数 - 实现全屏替换效果
function nextSlide() {
  // 计算下一页的起始位置，实现全屏替换
  const nextStartIndex = currentSlide.value + slidesPerView.value;

  if (nextStartIndex < carouselSlides.value.length) {
    currentSlide.value = nextStartIndex;
  } else {
    // 如果超出范围，回到第一页
    currentSlide.value = 0;
  }
}

function prevSlide() {
  // 计算上一页的起始位置，实现全屏替换
  const prevStartIndex = currentSlide.value - slidesPerView.value;

  if (prevStartIndex >= 0) {
    currentSlide.value = prevStartIndex;
  } else {
    // 如果小于0，跳转到最后一页
    currentSlide.value = Math.max(0, carouselSlides.value.length - slidesPerView.value);
  }
}

function goToSlide(pageIndex: number) {
  // 根据页码计算对应的起始位置
  const startIndex = pageIndex * slidesPerView.value;

  if (startIndex < carouselSlides.value.length) {
    currentSlide.value = startIndex;
  } else {
    // 如果超出范围，跳转到最后一页
    currentSlide.value = Math.max(0, carouselSlides.value.length - slidesPerView.value);
  }
}

// 自动播放
function startAutoPlay() {
  // 先清除现有定时器，防止多个定时器同时运行
  stopAutoPlay();
  autoPlayInterval.value = setInterval(() => {
    nextSlide();
  }, 5000); // 每5秒切换
}

function stopAutoPlay() {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
  }
}

// 在组件挂载时启动自动播放
onMounted(() => {
  startAutoPlay();
});

// 在组件卸载时清除定时器
onUnmounted(() => {
  stopAutoPlay();
});

// 项目展开索引
const activeProjectIndex = ref<number>(0); // 默认展开第一个项目

function setActiveProject(index: number) {
  // 如果点击的是已经展开的项目，则收起；否则展开
  if (activeProjectIndex.value === index) {
    activeProjectIndex.value = -1; // 收起
  } else {
    activeProjectIndex.value = index; // 展开
  }
}

function goToContact() {
  // 实现联系页面跳转
  console.log('Go to contact');
}

function goToServices() {
  // 实现服务页面跳转
  console.log('Go to services');
}

function goToNews(event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  // 实现新闻页面跳转
  console.log('Go to news');
}



// 检测移动端设备
const isMobile = ref(false);
// 视口宽度（用于更精细的断点控制）
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920);

// 处理窗口大小变化
function handleResize() {
  checkMobile();
  // 移除物理引擎相关的 resize 处理代码
  updateRootRem();
}

// 检测设备类型
function checkMobile() {
  const wasMobile = isMobile.value;
  // 更新视口宽度
  if (typeof window !== 'undefined') {
    viewportWidth.value = window.innerWidth;
  }
  isMobile.value = window.innerWidth <= 768;

  // 轮播在断点变化时修正索引，避免越界
  // 确保当前slide索引在有效范围内
  const maxValidIndex = Math.max(0, carouselSlides.value.length - slidesPerView.value);
  if (currentSlide.value > maxValidIndex) {
    currentSlide.value = maxValidIndex;
  }

  // 如果从桌面端切换到移动端，收起所有项目
  if (!wasMobile && isMobile.value) {
    // 移动端显示所有项目，不需要activeProjectIndex控制
  } else if (wasMobile && !isMobile.value) {
    // 从移动端切换回桌面端，恢复展开第一个项目
    activeProjectIndex.value = 0;
  }
}





function toNewTab(url: string) {
  if (!url) return;
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

function navTo(url: string) {
  router.push(url);
}

// 跳转到 About 页面的 Contact 部分
function navigateToContact(event?: Event) {
  if (event) {
    event.preventDefault(); // 阻止默认行为
  }
  router.push('/portal/about').then(() => {
    // 使用 nextTick 确保页面已经渲染完成
    setTimeout(() => {
      const contactElement = document.getElementById('contact');
      if (contactElement) {
        contactElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  });
}

// 基于屏幕宽度的每屏显示张数（<=480:1，481-768:2，>768:3）
const slidesPerView = computed(() => {
  const width = viewportWidth.value;
  if (width <= 480) return 1;      // 小屏幕：1列
  if (width <= 768) return 2;      // 中等屏幕：2列
  return 3;                        // 大屏幕：3列
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(carouselSlides.value.length / slidesPerView.value);
});

// 最大可滚动索引
const maxSlideIndex = computed(() => Math.max(0, carouselSlides.value.length - slidesPerView.value));

// 指示点索引集合 - 基于页数而不是slide数
const paginationIndexes = computed(() => {
  return Array.from({ length: totalPages.value }, (_, i) => i);
});

// 当前页码
const currentPage = computed(() => {
  return Math.floor(currentSlide.value / slidesPerView.value);
});

</script>

<template>

  <div class="gensi-home" :class="{ 'is-dark': isDark }">
    <!-- 顶部导航 -->
    <div class="hero-wrapper">
      <Header />
      <!-- 英雄区域 -->

      <section class="hero-section">

        <div class="hero-carousel-container">
          <h2 class="research-title relative" style=" margin-bottom: 20px;">{{ $t('portal.home.greeting') }}</h2>
          <!-- 轮播图主体 -->
          <div class="hero-carousel" ref="carouselContainer" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
            <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }">
              <div v-for="(item, index) in carouselSlides" :key="item.id ?? index" class="carousel-slide">
                <div class="item-card">
                  <div class="news-card">
                    <div class="card-image-container" @click="toNewTab(item.link_url)">
                      <img :src="item.cover || item.image || imgImage21" :alt="getLocalizedContent(item) || item.title"
                        class="card-image" role="button" tabindex="0" />
                      <div class="image-overlay"></div>
                    </div>
                    <div class="card-content">
                      <!-- 添加标题行 - 只在有标题时显示 -->
                      <div v-if="getLocalizedTitle(item)" class="card-header">
                        <h2 class="card-main-title" v-html="getLocalizedTitle(item)" @click="toNewTab(item.link_url)"
                          role="button" tabindex="0"></h2>
                      </div>
                      <div class="card-text" :class="{ 'no-title': !getLocalizedTitle(item) }">
                        <h3 class="card-title" v-html="getLocalizedCarouselTitle(item)" @click="toNewTab(item.link_url)"
                          role="button" tabindex="0"></h3>
                      </div>
                      <div class="read-more-link" @click="toNewTab(item.link_url)">
                        <span>{{ $t('portal.home.readMore') }}</span>
                        <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
                          <path d="M5 10L15 10M12 7L15 10L12 13" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 导航点 -->
          <div class="carousel-dots">
            <button v-for="page in paginationIndexes" :key="page" class="carousel-dot"
              :class="{ active: currentPage === page }" @click="goToSlide(page)"></button>
          </div>
        </div>
      </section>
    </div>
    <!-- <section class="hero-section"> 
      <div class="container">
        <div class="hero-content">
          <div class="hero-left">
            <Motion as="p" class="hero-greeting" :initial="{ opacity: 0, x: 100 }" :while-in-view="{ opacity: 1, x: 0 }"
              :transition="{ delay: 0.1, duration: 0.8, ease: 'easeOut' }">
              Hi, this is GenSI Lab.
            </Motion>
            <Motion as="h1" class="hero-title" :initial="{ opacity: 0, x: 120 }" :while-in-view="{ opacity: 1, x: 0 }"
              :transition="{ delay: 0.3, duration: 0.8, ease: 'easeOut' }">
              The Generative Symbolic 
              <TextHighlight class="rounded-lg bg-gradient-to-r from-#d3fd47 to-#a0e9fa">
                Intelligence
            </TextHighlight>
              <Motion :initial="{ opacity: 0, x: 80 }" :while-in-view="{ opacity: 1, x: 0 }"
                :transition="{ delay: 0.5, duration: 0.8, ease: 'easeOut' }">
                <div>
                  Group .
                </div>
              </Motion>
            </Motion>
            <Motion as="p" class="hero-description" :initial="{ opacity: 0, x: 100 }"
              :while-in-view="{ opacity: 1, x: 0 }" :transition="{ delay: 0.7, duration: 0.8, ease: 'easeOut' }">
              Our long-term goal is to achieve AGI by creating AI scientists.
            </Motion>
            <Motion class="hero-buttons" :initial="{ opacity: 0, x: 90, y: 20 }"
              :while-in-view="{ opacity: 1, x: 0, y: 0 }" :transition="{ delay: 0.9, duration: 0.8, ease: 'easeOut' }">
              <button class="btn btn-project btn-contact" @click="navigateToContact($event)">
                      Contact Us
                      <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
                        <path d="M5 10L15 10M12 7L15 10L12 13" stroke="white" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </svg>
                    </button>
            </Motion>
          </div>
          <div class="hero-right flex justify-end">
            <div class="circle-container">
              <div class="circle circle-1 circle-animate circle-animate-1" >
                <img src="../assests/home/t1.png" alt="circle" class="circle-image" />
              </div>
              <div class="circle circle-2 circle-animate circle-animate-2">
                <img src="../assests/home/t2.png" alt="circle" class="circle-image" />
              </div>
              <div class="circle circle-3 circle-animate circle-animate-3" >
                <img src="../assests/home/t3.png" alt="circle" class="circle-image" />
              </div>
              <div class="circle circle-4 circle-animate circle-animate-4">
                <img src="../assests/home/t4.png" alt="circle" class="circle-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- 研究方向 -->
    <section class="research-section">
      <div class="container">
        <div class="research-header-container">
          <div class="research-header">
            <h2 class="research-title relative">
              <div>{{ $t('portal.home.research.title') }}</div>
              <!-- <img src="../assests/home/zs.png" alt="Our research directions"
                class="research-title-image absolute right-0 bottom-0 z-0" /> -->
            </h2>
            <Motion as="p" class="research-description" :initial="{ opacity: 0, y: 30 }"
              :while-in-view="{ opacity: 1, y: 0 }" :transition="{ delay: 0.3, duration: 0.8, ease: 'easeOut' }">
              <span class="typewriter-text" :data-text="localizedHomeDescription" v-if="localizedHomeDescription">
                {{ animatedDescription }}
              </span>
            </Motion>
          </div>
        </div>

        <div class="research-content">
          <div class="research-categories-centered">
            <!-- <div class="category-label side-label">AGI via LLM</div>
            <div class="center-section">
              <div class="category-label observation-hypothesis">OBSERVATION</div>
              <div class="arrows-container">
                <img src="../assests/home/arrl.png" alt="" class="arrow-img">
                <img src="../assests/home/arrr.png" alt="" class="arrow-img">
              </div>
              <div class="category-label observation-hypothesis">HYPOTHESIS</div>
            </div>
            <div class="category-label side-label">AI4S Foundation Model</div> -->

            <img :src="isDark ? homethinkDark : homethinkLight" alt="">
          </div>

          <!-- <div class="research-cards">
            <div class="research-card card-left">
              <div ref="physicsContainer" class="physics-container">
              </div>
            </div>

            <div class="research-card card-right">
              <div class="bubbles-container">
                <Motion 
                  v-for="(bubble, index) in bubbles" 
                  :key="bubble.id"
                  as="div"
                  :class="['bubble', bubble.class]" 
                  :style="{
                    left: getBubblePosition(bubble).x,
                    bottom: getBubblePosition(bubble).y,
                  }"
                  :initial="{ 
                    opacity: 0, 
                    y: 20
                  }"
                  :while-in-view="{ 
                    opacity: 1, 
                    y: 0
                  }"
                  :animate="{
                    y: [0, -18, -6, -20, 0],
                    x: [0, bubble.id % 2 === 0 ? 8 : -8, bubble.id % 2 === 0 ? -6 : 6, bubble.id % 2 === 0 ? 12 : -12, 0],
                    rotate: [0, bubble.id % 2 === 0 ? 3 : -3, bubble.id % 2 === 0 ? -2 : 2, bubble.id % 2 === 0 ? 5 : -5, 0]
                  }"
                  :transition="{ 
                    opacity: { delay: bubble.delay, duration: 0.8, ease: 'easeOut' },
                    y: { 
                      repeat: Infinity, 
                      duration: 3 + bubble.id * 0.5,
                      ease: 'easeInOut',
                      delay: bubble.delay
                    },
                    x: { 
                      repeat: Infinity, 
                      duration: 4 + bubble.id * 0.4,
                      ease: 'easeInOut',
                      delay: bubble.delay + 0.8
                    },
                    rotate: { 
                      repeat: Infinity, 
                      duration: 5 + bubble.id * 0.6,
                      ease: 'easeInOut',
                      delay: bubble.delay + 1.2
                    }
                  }"
                  v-html="bubble.text">
                </Motion>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </section>

    <!-- 最新项目 -->
    <section class="project-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('portal.home.recentProject') }}</h2>
          <a class="read-all-link" @click="navTo('/portal/research')">{{ $t('portal.home.readAll') }}</a>
        </div>

        <div class="project-list">
          <div v-for="project in projectList" :key="project.name" class="project-accordion">
            <!-- 所有项目都展开显示完整卡片 -->
            <div class="project-card accordion-card expanded-project">
              <div class="project-content">
                <h3 class="project-title">{{ getLocalizedProjectTitle(project) }}</h3>
                <div class="project-description"
                  v-html="appStore.locale === 'zh-CN' ? (project.content_cn || project.description) : (project.description || project.content_cn)">

                </div>
                <button class="btn btn-project" @click="toNewTab(project.link_url)">
                  {{ $t('portal.home.readMore') }}
                  <svg class="arrow-icon" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10L15 10M12 7L15 10L12 13" stroke="white" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
              <div v-if="project.cover" class="project-image" @click="openImagePreview(project.cover, project.title)">
                <img :src="project.cover" alt="Scientific Data Visualization" />
                <div class="image-overlay">
                  <svg class="preview-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <span>{{ $t('portal.home.clickToPreview') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关注我们 -->
    <section class="follow-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('portal.home.followUs') }}</h2>

        </div>

        <div class="follow-cards">
          <div class="follow-card" v-for="item in followUsList" :key="item.id" @click="toNewTab(item.link)">
            <div class="flex justify-between">
              <div class="dh">
                <img src="../assests/home/dh.png" alt="">
              </div>
              <div class="follow-quote">
                <!-- <span class="quote-icon">「</span>
                <span class="highlight">{{ $t('portal.home.gensiDepth') }}</span>
                <span class="quote-icon">」</span> -->
                <span class="follow-text">
                  {{ getLocalizedFollowUsContent(item) }}
                </span>
              </div>
            </div>
            <div class="follow-date">{{ item.time }}</div>

            <div class="arrowbox flex justify-center items-center absolute right-0 bottom-0 w-24 h-24">
              <span class="arrow-icon font-bold text-2xl">→</span>
            </div>
          </div>



          <!-- <div class="follow-card">
            <div class="flex justify-between">
              <div class="dh ">
                <img src="../assests/home/dh.png" alt="">
              </div>
              <div class="follow-quote">
                <span class="quote-icon">「</span>
                <span class="highlight">GenSI深度</span>
                <span class="quote-icon">」</span>
                <span class="follow-text">
                  请进，GenSI上新了科研机会。 如果你对AI前沿技术、生成模型或AI在科学领域的应用充满兴趣，热爱挑战，欢迎关注和联系我们！
                </span>
              </div>
            </div>
            <div class="follow-date">Mar 27, 2025</div>

            <div class="arrowbox flex justify-center items-center absolute right-0 bottom-0 w-24 h-24" @click="toNewTab('https://www.xiaohongshu.com/user/profile/65465f81000000000301f9bd')">
              <span class="arrow-icon font-bold text-2xl">→</span>
            </div>
          </div> -->
        </div>

        <div class="follow-platforms">
          <div class="follow-platform">
            <div class="platform-icon wechat"></div>
            <span class="platform-name">GenSI根思</span>
          </div>

          <div class="follow-platform"
            @click="toNewTab('https://www.xiaohongshu.com/user/profile/65465f81000000000301f9bd')">
            <div class="platform-icon xiaohongshu"></div>
            <span class="platform-name">GenSI根思</span>
          </div>
        </div>


      </div>
    </section>

    <!-- 关注我们 - 社交图标 -->
    <footer class="follow-footer">
      <div class="follow-social-links">
        <div class="follow-social" @click="toNewTab('https://github.com/GenSI-THUAIR')">
          <img src="../assests/home/github.png" alt="">
        </div>
        <div class="follow-social" @click="toNewTab('https://huggingface.co/GenSI')">
          <img src="../assests/home/huggingface.png" alt="">
        </div>
        <div class="follow-social" @click="toNewTab('https://x.com/hello_gensi')">
          <img src="../assests/home/x.png" alt="">
        </div>
        <div class="follow-social" @click="toNewTab('https://www.youtube.com/@hello_gensi')">
          <img src="../assests/home/youtube.png" alt="">
        </div>
      </div>
    </footer>
    <Footer />

    <!-- 返回顶部按钮 -->
    <BackToTop />

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="imagePreview.show" class="image-preview-modal" @click="closeImagePreview">
        <div class="image-preview-container">
          <div class="image-preview-header flex justify-end">
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
@import url('../assests/common.css');

.header {
  background: transparent;
}

.header.is-dark {
  background: transparent;
}

.hero-title span {
  margin-top: 10px;
  margin-bottom: 10px;
}

.arrowbox {
  background-image: url('../assests/home/by.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  opacity: 1;
  transition: all 0.3s ease;
  cursor: pointer;
  position: absolute;
  bottom: 0;
  right: 0;
}

.arrowbox .arrow-icon {
  transform: rotate(0deg) !important;
}


.dh {
  background-image: url('../assests/home/dhbg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 20px;
  width: 60px;
  height: 60px;
}







/* 基础样式 */
.gensi-home {
  font-family: 'Sora', sans-serif;
  background: #ffffff;
  color: #000000;
  -webkit-overflow-scrolling: touch;
  /* iOS滚动优化 */
  overflow-x: hidden;
  /* 防止水平滚动 */
}

/* 移动端触摸优化 */
* {
  -webkit-tap-highlight-color: transparent;
  /* 移除移动端点击高亮 */
  -webkit-touch-callout: none;
  /* 禁用长按菜单 */
}

/* 移动端按钮优化 */
.btn,
.mobile-nav-link,
.nav-link {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.container {
  max-width: 60%;
  margin: 0 auto;
  padding: 10px 20px;
}





.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-greeting {
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  color: #666;
}

.hero-title {
  font-size: 3.75rem;
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 1.875rem;
  color: #000000;
}

.hero-description {
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  color: #666;
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 1rem;
  border: none;
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  /* background: linear-gradient(73.86deg, #d7ff39 2.04%, #9ee8ff 96.1%); */
  color: #fff;
  background: #000;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.arrow-icon {
  width: 1.5rem;
  height: 1.5rem;
  transform: rotate(-45deg);
  transition: all 0.3s ease;
}

/* 圆形装饰 */
.circle-container {
  position: relative;
  width: 31.25rem;
  height: 31.25rem;
}

.circle {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15rem;
  height: 15rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.circle>img:hover {
  transform: scale(1.2);
  transition: all 0.3s ease;
}

/* .circle:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
} */

.circle-1 {


  top: 0;
  left: 0;
  background-image: url('../assests/home/y1.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}



.circle-2 {
  top: 0;
  right: 0;
  background-image: url('../assests/home/y2.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.circle-3 {
  bottom: 0;
  left: 0;
  background-image: url('../assests/home/y3.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.circle-4 {
  bottom: 0;
  right: 0;
  background-image: url('../assests/home/y4.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

/* Circle 动画 */
.circle-animate {
  opacity: 0;
  transform: translateY(40px);
  animation: circleSlideUp 0.8s ease-out forwards;
}

.circle-animate-1 {
  animation-delay: 0.2s;
}

.circle-animate-2 {
  animation-delay: 0.4s;
}

.circle-animate-3 {
  animation-delay: 0.6s;
}

.circle-animate-4 {
  animation-delay: 0.8s;
}

@keyframes circleSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 合作伙伴 */
.partners-section {
  padding: 2.5rem 0;
  background: #f0f0f0;
  text-align: center;
}

.partners-label {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.partners-logos {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5rem;
}

.partner-logo {
  height: 2.75rem;
  width: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.partner-logo:hover {
  transform: scale(1.1);
  opacity: 0.8;
}

/* 研究方向 */
.research-section {
  padding: 3.75rem 0;
  background: url('../assests/home/section2bg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.research-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  margin-bottom: 5rem;
}

.research-title {
  font-size: 2.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.research-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
}

.research-categories {
  gap: 5rem;
  margin-bottom: 2.5rem;
}

.research-categories-centered {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.side-label {
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
}

.side-label:first-child {
  left: 0;
}

.side-label:last-child {
  right: 0;
}

.center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2.5rem;
  border-radius: 1rem;
}

.observation-hypothesis {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.arrows-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.arrow-img {
  height: 1rem;
  width: auto;
}

.category-label {
  font-size: 2rem;
  font-weight: bold;
}

.research-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.research-card {
  height: 500px;
  border-radius: 24px;
  padding: 0px;
  position: relative;
  overflow: hidden;
}

.card-left {
  background: #9ee8ff;
}

.card-right {
  background: #d7ff39;
}

.card-items {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 20px;
  overflow: hidden;
}







.card-item {
  background: white;
  padding: 16px 32px;
  border-radius: 44px;
  font-size: 32px;
  font-weight: bold;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.card-item:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 掉落动画 */
.drop-item {
  transform: translateY(-400px);
  opacity: 0;
  animation-fill-mode: forwards;
}

.drop-item.start-drop {
  animation: dropAndBounce 1.2s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

/* 不同元素的掉落变化 */
.drop-item.memory.start-drop {
  animation: dropAndBounce1 1.3s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

.drop-item.abstract.start-drop {
  animation: dropAndBounce2 1.4s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

.drop-item.induction.start-drop {
  animation: dropAndBounce3 1.2s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

.drop-item.reasoning.start-drop {
  animation: dropAndBounce4 1.5s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

.drop-item.autonomous.start-drop {
  animation: dropAndBounce5 1.3s cubic-bezier(0.17, 0.67, 0.35, 1) forwards;
}

@keyframes dropAndBounce {
  0% {
    transform: translateY(-400px) rotate(-5deg);
    opacity: 0;
  }

  60% {
    transform: translateY(20px) rotate(2deg);
    opacity: 1;
  }

  80% {
    transform: translateY(-10px) rotate(-1deg);
  }

  90% {
    transform: translateY(5px) rotate(0.5deg);
  }

  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
}

@keyframes dropAndBounce1 {
  0% {
    transform: translateY(-450px) translateX(-30px) rotate(-8deg);
    opacity: 0;
  }

  67% {
    transform: translateY(25px) translateX(5px) rotate(3deg);
    opacity: 1;
  }

  85% {
    transform: translateY(-8px) translateX(-2px) rotate(-1deg);
  }

  95% {
    transform: translateY(3px) translateX(1px) rotate(0.5deg);
  }

  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
}

@keyframes dropAndBounce2 {
  0% {
    transform: translateY(-420px) translateX(40px) rotate(6deg);
    opacity: 0;
  }

  58% {
    transform: translateY(18px) translateX(-8px) rotate(-2deg);
    opacity: 1;
  }

  78% {
    transform: translateY(-12px) translateX(3px) rotate(1deg);
  }

  92% {
    transform: translateY(4px) translateX(-1px) rotate(-0.5deg);
  }

  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
}

@keyframes dropAndBounce3 {
  0% {
    transform: translateY(-480px) translateX(-20px) rotate(-4deg);
    opacity: 0;
  }

  62% {
    transform: translateY(22px) translateX(10px) rotate(2.5deg);
    opacity: 1;
  }

  82% {
    transform: translateY(-15px) translateX(-4px) rotate(-1.5deg);
  }

  94% {
    transform: translateY(6px) translateX(2px) rotate(0.8deg);
  }

  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
}

@keyframes dropAndBounce4 {
  0% {
    transform: translateY(-390px) translateX(25px) rotate(7deg);
    opacity: 0;
  }

  68% {
    transform: translateY(28px) translateX(-12px) rotate(-3deg);
    opacity: 1;
  }

  86% {
    transform: translateY(-18px) translateX(6px) rotate(1.5deg);
  }

  96% {
    transform: translateY(8px) translateX(-3px) rotate(-0.8deg);
  }

  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
}

@keyframes dropAndBounce5 {
  0% {
    transform: translateY(-460px) translateX(-35px) rotate(-9deg);
    opacity: 0;
  }

  64% {
    transform: translateY(24px) translateX(15px) rotate(4deg);
    opacity: 1;
  }

  84% {
    transform: translateY(-14px) translateX(-7px) rotate(-2deg);
  }

  94% {
    transform: translateY(5px) translateX(3px) rotate(1deg);
  }

  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 1;
  }
}

/* 颜色样式 */
.memory {
  background: white;
  color: black;
  border: 2px solid #e0e0e0;
}

.abstract {
  background: #7bd8f4;
  color: black;
}

.induction {
  background: #d7ff39;
  color: black;
}

.reasoning {
  background: black;
  color: white;
}

.autonomous {
  background: #c8bbf1;
  color: black;
}

/* 研究标题容器动画 */
.research-header-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transform: translateY(30px);
  animation: slideUpFadeIn 1.0s ease-out 0.3s forwards;
}

@keyframes slideUpFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bubbles-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #d7ff39;
  border-radius: 24px;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: #ffffff;
  color: black;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  transform-origin: center center;
  font-family: 'Sora', sans-serif;
  z-index: 2;
}

/* 气泡动画已使用 Motion 组件替换 */



.bubble.small {
  width: 60px;
  height: 60px;
  font-size: 12px;
  font-weight: 600;
}

.bubble.medium {
  width: 130px;
  height: 130px;
  font-size: 16px;
  font-weight: 600;
}

.bubble.large {
  width: 180px;
  height: 180px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}

.bubble.extra-large {
  width: 250px;
  height: 250px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}



/* 颜色样式 - 实心效果 */
.bubble.blue {
  background: #9ee8ff;
  color: #000;
}

.bubble.white {
  background: #ffffff;
  color: #000;
}

.bubble.purple {
  background: #c8bbf1;
  color: #000;
}

.bubble.pink {
  background: #ffb3d9;
  color: #000;
}

.bubble.green {
  background: #90ee90;
  color: #000;
}

.bubble.black {
  background: #000000;
  color: #ffffff;
}



.observation-hypothesis {
  display: flex;
  justify-content: center;
  gap: 200px;
}

.obs-hyp-item {
  font-size: 24px;
  font-weight: bold;
}

/* 新闻部分 */
.news-section {
  padding: 6.25rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3.75rem;
}

.section-title {
  font-size: 2.25rem;
  font-weight: bold;
}

.read-all-link {
  font-size: 1.25rem;
  text-decoration: underline;
  color: #000000;
  transition: all 0.3s ease;
  cursor: pointer;
}

.read-all-link:hover {
  color: #c0c0c0;
  transition: all 0.3s ease;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.news-card {
  border-radius: 1.5rem;
  padding: 2rem;
  height: 37.5rem;
  display: flex;
  flex-direction: column;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  transition: all 0.3s ease;
  background-color: #fff;
  border: 0.15rem solid #000;
}



.news-image {
  height: 12.5rem;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1.25rem;
  position: relative;
  cursor: pointer;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1.25rem;
  flex: 1;
}

.news-date {
  font-size: 1.125rem;
  opacity: 0.8;
  margin-bottom: 1.875rem;
}

.btn-news {
  background: black;
  color: white;
  align-self: flex-start;
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
}

.btn-news::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: black;
  border-radius: 50%;
  top: -6px;
  right: -6px;
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

/* 项目部分 */
.project-section {
  padding: 2.5rem 0;
  background: linear-gradient(135deg,
      rgba(158, 232, 255, 0.15) 0%,
      rgba(160, 232, 253, 0.25) 25%,
      rgba(158, 232, 255, 0.35) 50%,
      rgba(160, 232, 253, 0.25) 75%,
      rgba(158, 232, 255, 0.15) 100%);
  position: relative;
  overflow: hidden;
  min-height: 100%;
}

.project-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      rgba(158, 232, 255, 0.05) 0%,
      rgba(160, 232, 253, 0.15) 20%,
      rgba(158, 232, 255, 0.25) 40%,
      rgba(160, 232, 253, 0.35) 60%,
      rgba(158, 232, 255, 0.25) 80%,
      rgba(160, 232, 253, 0.05) 100%);
  opacity: 0;
  animation: fadeInBackground 2s ease-in-out 0.5s forwards;
  z-index: 0;
  pointer-events: none;
}

.project-section>.container {
  position: relative;
  z-index: 1;
}

@keyframes fadeInBackground {
  0% {
    opacity: 0;
    transform: scale(1.1);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.project-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem 3rem;
  margin-bottom: 1.5rem;
}

.project-card.accordion-card {
  grid-template-columns: 1fr;
  gap: 50px;
}

.project-card.accordion-card .project-content {
  grid-column: 1;
}

.project-card.accordion-card .project-image {
  grid-column: 2;
  border-radius: 1rem;
  overflow: hidden;
}

.project-card.accordion-card .project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-card.accordion-card:has(.project-image) {
  grid-template-columns: 1fr 25rem;
}

.accordion-card.expanded-project .project-body .project-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 300px;
}

.accordion-card.expanded-project .project-body .project-image {
  border-radius: 1rem;
  overflow: hidden;
  height: 18.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 0.125rem solid #ccc;
  padding: 0.9375rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
}

.accordion-card.expanded-project .project-body .project-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.project-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accordion-card.expanded-project .project-description {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accordion-card.expanded-project .project-content .btn-project {
  align-self: flex-start;
  margin-top: auto;
}

.accordion-card.expanded-project .project-description ul li {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #000;
}

.project-description ul {
  margin-top: 0.625rem;
  padding-left: 1.875rem;
}

.project-description li {
  margin-bottom: 0.625rem;
}


.btn-project {
  background: black;
  color: white;
  align-self: flex-start;
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
  padding: 0.8rem 1.25rem;
  font-size: 1rem;
  border-radius: 1rem;
}

.btn-project::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: black;
  border-radius: 50%;
  top: -4px;
  right: -4px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.btn-project:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  color: #a0e8fd;
}

.btn-contact:hover {
  color: #fff;
}

.btn-project:hover::after {
  opacity: 1;
  transform: scale(1);
}

.btn-project:hover .arrow-icon {
  transform: rotate(0deg);
}

.project-image {
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-image:hover img {
  transform: scale(1.05);
}

.project-image .image-overlay {
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

.project-image .preview-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.project-image .image-overlay span {
  color: #ffffff;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.project-list {
  display: flex;
  flex-direction: column;
}

.project-accordion {
  margin-bottom: 20px;
}

.accordion-card {
  margin-top: 20px;
  margin-bottom: 0;
}

.accordion-card.expanded-project {
  margin-top: 0;
  border: 0.15rem solid #000;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

}

.accordion-card.expanded-project:hover {
  border: 0.15rem solid #000;
  transform: translateY(-0.2rem) translateX(-0.1rem);
  box-shadow: 0.3rem 0.3rem 0 0 rgba(0, 0, 0, 1);
  background: linear-gradient(135deg, #a0e8fd 0%, #c8e6ff 50%, #a0e8fd 100%);
  transition: all 1s ease;
}

.accordion-card.expanded-project>* {
  position: relative;
  z-index: 1;
}







.accordion-card.expanded-project {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: start;
}



.accordion-card.expanded-project .project-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.accordion-card.expanded-project .project-image {
  border-radius: 1rem;
  overflow: hidden;
  height: 13rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 0.5rem;
  margin: auto 0
}

.accordion-card.expanded-project .project-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.accordion-card.expanded-project .btn-project {
  align-self: flex-start;
  margin-top: auto;
  color: white;
  border: 2px solid #000;
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.accordion-card.expanded-project .btn-project::after {
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

.accordion-card.expanded-project .btn-project:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  color: #a0e8fd;
}

.accordion-card.expanded-project .btn-project:hover::after {
  opacity: 1;
  transform: scale(1);
}

.accordion-card.expanded-project .btn-project:hover .arrow-icon {
  transform: rotate(0deg);
  stroke: #a0e8fd;
}

.accordion-card.expanded-project .btn-project:active {
  transform: translateY(-1px);
  transition: transform 0.1s ease;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.project-item {
  background: white;
  border-radius: 16px;
  padding: 30px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 0;
  transition: all 0.3s ease;
  background-color: #fff;
  border: 3px solid #000;
}

.project-item:hover {
  transform: translateY(-5px) translateX(-3px);
  box-shadow: 6px 6px 0 0 rgba(0, 0, 0, 1);
}






.project-arrow {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s;
}

.project-arrow.open {
  transform: rotate(90deg);
  background: #d7ff39;
}

/* 关注我们 */
.follow-section {
  padding: 3.75rem 0;
  background: #f8f9fa;
}

.follow-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.follow-platforms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.follow-card {
  background: white;
  border: 0.15rem solid #000000;
  border-radius: 1.25rem;
  padding: 2rem;
  height: 13rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.follow-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 200%;
  height: 200%;
  background: #d7ff39;
  border-radius: 50%;
  transform: translate(70%, 70%) scale(0);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
}

.follow-card:hover::before {
  transform: translate(30%, 30%) scale(1);
}

.follow-card .dh,
.follow-card .follow-quote,
.follow-card .follow-date,
.follow-card .follow-platform {
  position: relative;
  z-index: 1;
}

.follow-quote {
  font-size: 1.25rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  flex: 1;
}

.quote-icon {
  font-weight: bold;
}

.highlight {
  font-weight: bold;
}

.follow-text {
  font-size: 1.25rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-date {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  margin-left: 4.375rem;
  /* 与右侧文字内容左对齐 */
}

.follow-platform {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
}

.platform-icon.wechat {
  background-image: url('../assests/home/wx.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.platform-icon.xiaohongshu {
  background-image: url('../assests/home/rn.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.platform-name {
  font-size: 1.75rem;
  font-weight: bold;
}

.hero-wrapper {
  background: radial-gradient(ellipse 150% 100% at center 8%, #e8ff91 0%, #f0f8d4 20%, #f8fce8 40%, #ffffff 67%);
}

/* ========== Dark Mode Styles ========== */
.gensi-home.is-dark {
  background: #121212;
  color: #e0e0e0;
}

.gensi-home.is-dark .hero-wrapper {
  background: radial-gradient(ellipse 150% 100% at center 8%, #1a2e10 0%, #162414 20%, #14191a 40%, #121212 67%);
}

.gensi-home.is-dark .research-title {
  color: #e0e0e0;
}

.gensi-home.is-dark .research-description {
  color: #ccc;
}

.gensi-home.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.gensi-home.is-dark .research-section {
  background-color: #121212;
}

.gensi-home.is-dark .research-categories-centered img {
  filter: brightness(0.85) contrast(1.1);
}

.gensi-home.is-dark .section-title {
  color: #e0e0e0;
}

.gensi-home.is-dark .section-header .read-all-link {
  color: #9ee8ff;
}

.gensi-home.is-dark .section-header .read-all-link:hover {
  color: #7bd8f4;
}

.gensi-home.is-dark .project-section {
  background: linear-gradient(135deg,
      rgba(20, 60, 80, 0.4) 0%,
      rgba(15, 50, 70, 0.5) 25%,
      rgba(20, 60, 80, 0.6) 50%,
      rgba(15, 50, 70, 0.5) 75%,
      rgba(20, 60, 80, 0.4) 100%);
}

.gensi-home.is-dark .project-section::before {
  background: linear-gradient(135deg,
      rgba(20, 60, 80, 0.1) 0%,
      rgba(15, 50, 70, 0.2) 20%,
      rgba(20, 60, 80, 0.3) 40%,
      rgba(15, 50, 70, 0.4) 60%,
      rgba(20, 60, 80, 0.3) 80%,
      rgba(15, 50, 70, 0.1) 100%);
}

.gensi-home.is-dark .project-card {
  background: #1e1e1e;
  border-color: #444;
}

.gensi-home.is-dark .project-title {
  color: #e0e0e0;
}

.gensi-home.is-dark .project-description,
.gensi-home.is-dark .project-description :deep(*) {
  color: #ccc !important;
}

.gensi-home.is-dark .accordion-card.expanded-project {
  border-color: #555;
}

.gensi-home.is-dark .accordion-card.expanded-project:hover {
  border-color: #777;
  box-shadow: 0.3rem 0.3rem 0 0 rgba(158, 232, 255, 0.3);
  background: linear-gradient(135deg, #0d3a4e 0%, #153040 50%, #0d3a4e 100%);
}

.gensi-home.is-dark .accordion-card.expanded-project .project-description ul li {
  color: #ccc;
}

.gensi-home.is-dark .btn-project {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.gensi-home.is-dark .btn-project:hover {
  background: #9ee8ff;
  color: #1a1a1a;
  box-shadow: 0 8px 25px rgba(158, 232, 255, 0.3);
}

.gensi-home.is-dark .btn-project::after {
  background: #e0e0e0;
}

.gensi-home.is-dark .accordion-card.expanded-project .btn-project {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #555;
}

.gensi-home.is-dark .accordion-card.expanded-project .btn-project:hover {
  background: #9ee8ff;
  color: #1a1a1a;
}

.gensi-home.is-dark .follow-section {
  background: #1a1a1a;
}

.gensi-home.is-dark .follow-card {
  background: #1e1e1e;
  border-color: #555;
  color: #e0e0e0;
}

.gensi-home.is-dark .follow-card::before {
  background: #0d4a5e;
}

.gensi-home.is-dark .follow-text {
  color: #e0e0e0;
}

.gensi-home.is-dark .follow-date {
  color: #999;
}

.gensi-home.is-dark .platform-name {
  color: #e0e0e0;
}

.gensi-home.is-dark .follow-footer {
  background: #1a1a1a;
}

.gensi-home.is-dark .follow-social {
  background-color: #2a2a2a;
}

.gensi-home.is-dark .follow-social:nth-child(-n+3) img {
  filter: brightness(0) invert(1);
}

.gensi-home.is-dark .news-card {
  background-color: #1e1e1e;
  border-color: #444;
}

.gensi-home.is-dark .card-content {
  color: #e0e0e0;
  background: rgba(30, 30, 30, 0.85);
}

.gensi-home.is-dark .card-main-title,
.gensi-home.is-dark .card-main-title :deep(*) {
  color: #e0e0e0 !important;
}

.gensi-home.is-dark .card-title,
.gensi-home.is-dark .card-title :deep(*) {
  color: #ccc !important;
}

.gensi-home.is-dark .read-more-link {
  color: #9ee8ff;
}

.gensi-home.is-dark .carousel-dot {
  background: rgba(60, 60, 60, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.gensi-home.is-dark .carousel-dot.active {
  background: #d7ff39;
  border-color: #d7ff39;
}

.gensi-home.is-dark .hero-greeting {
  color: #999;
}

.gensi-home.is-dark .hero-title {
  color: #e0e0e0;
}

.gensi-home.is-dark .hero-description {
  color: #ccc;
}

.gensi-home.is-dark .project-item {
  background-color: #1e1e1e;
  border-color: #555;
  color: #e0e0e0;
}

.gensi-home.is-dark .project-arrow {
  background: #2a2a2a;
  color: #e0e0e0;
}

.gensi-home.is-dark .project-arrow.open {
  background: #0d4a5e;
}

.gensi-home.is-dark .arrowbox {
  filter: brightness(0.8) invert(0.1);
}


.gensi-home.is-dark .image-preview-modal {
  background: rgba(0, 0, 0, 0.85);
}

/* PC断点控制移除：采用 rem + 根字号缩放实现无级调节 */
/* PC断点控制移除：由 rem 缩放替代 */


@media (max-width: 768px) {
  .research-title-image {
    opacity: 0;
  }

  /* 统一容器样式 */
  .container {
    max-width: 90% !important;
  }

  /* 轮播图样式 - 769px及以下通用设置 */
  .hero-section {
    height: 720px;
    /* 增加轮播高度 */
    padding: 70px 0 110px 0;
  }

  .hero-carousel-container {
    max-width: 90% !important;
    height: 100%;
    transform: none !important;
    position: static !important;
    margin: 0 auto;
  }

  .hero-carousel-container .research-title {
    margin-top: 0;
    font-size: 28px;
    margin-bottom: 35px;
    position: relative;
    z-index: 1;
  }

  .hero-carousel {
    height: 520px !important;
    overflow: hidden !important;
    position: relative;
  }

  .carousel-slide {
    min-width: 50%;
    /* 默认双列显示 */
    height: 100% !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    box-sizing: border-box;
  }

  .carousel-track {
    height: 100% !important;
    display: flex;
  }

  .item-card {
    width: 100%;
    max-width: 100%;
    height: 480px;
    margin: 0;
    position: relative;
    box-sizing: border-box;
  }

  .card-image-container {
    height: 65%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
  }

  .card-content {
    height: 35%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 18px;
    box-sizing: border-box;
    border-radius: 0 0 16px 16px;
  }

  .card-header {
    margin-bottom: 8px;
  }

  .card-main-title {
    font-size: 19px;
    /* 确保标题字号大于内容 */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  :deep(.card-title h1),
  :deep(.card-title h2),
  :deep(.card-title h3) {
    font-size: 19px !important;
    /* 保持与主标题一致的字号 */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1 !important;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  .card-title {
    font-size: 16px;
    /* 内容字号小于标题 */
    line-height: 1.3;
    -webkit-line-clamp: 3;
    /* 内容限制为3行 */
    line-clamp: 3;
  }

  .card-text.no-title .card-title {
    -webkit-line-clamp: 4;
    /* 没有标题时显示更多行 */
    line-clamp: 4;
    word-break: break-word;
    /* 在单词边界处换行 */
    hyphens: auto;
    /* 自动连字符 */
  }

  .read-more-link {
    font-size: 16px;
    margin-top: 8px;
  }

  .arrow-icon {
    width: 14px;
    height: 14px;
  }

  .carousel-dots {
    left: 50%;
    transform: translateX(-50%);
    gap: 8px;
    position: absolute !important;
    z-index: 10;
  }

  .carousel-dot {
    width: 20px;
    height: 6px;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .carousel-dot.active {
    width: 32px;
    background: #000000;
    border-color: #000000;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: left;
  }

  .hero-title {
    font-size: 32px;
    line-height: 1.2;
    margin-bottom: 24px;
    font-weight: 600;
  }

  .hero-greeting {
    font-size: 16px;
    margin-bottom: 16px;
    color: #666;
  }

  .hero-description {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 32px;
    color: #333;
  }

  .hero-buttons {
    justify-content: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 14px 28px;
    font-size: 16px;
    border-radius: 12px;
  }

  .circle-container {
    width: 100%;
    height: 380px;
    margin: 0 auto;
    order: -1;
    padding: 16px;
    position: relative;
  }

  .circle {
    width: 120px;
    height: 120px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .circle:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  /* 移动端圆形位置优化 - 更紧凑的布局 */
  .circle-1 {
    top: 20px;
    left: 30px;
  }

  .circle-2 {
    top: 20px;
    right: 30px;
  }

  .circle-3 {
    bottom: 20px;
    left: 30px;
  }

  .circle-4 {
    bottom: 20px;
    right: 30px;
  }

  /* 移动端圆形图片优化 */
  .circle>img {
    width: 67%;
    height: 67%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .circle:active>img {
    transform: scale(0.9);
  }

  /* 合作伙伴 */
  .partners-section {
    padding: 50px 0;
    background: #f8f9fa;
  }

  .partners-section .container {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .partners-label {
    font-size: 18px;
    margin-bottom: 24px;
    color: #555;
    font-weight: 500;
  }

  .partner-logo {
    height: 36px;
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }

  .partner-logo:hover {
    opacity: 1;
  }

  /* 研究方向 */
  .research-section {
    padding: 60px 0;
    background: url('../assests/home/section2bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .research-header {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 50px;
  }

  .research-title {
    font-size: 28px;
    line-height: 1.3;
    text-align: left;
    font-weight: 600;
    color: #000;
  }

  .research-description {
    font-size: 16px;
    line-height: 1.6;
    text-align: left;
    color: #333;
  }

  .research-categories-centered {
    flex-direction: column;
    gap: 32px;
    margin-bottom: 40px;
    align-items: flex-start;
  }

  .side-label {
    position: static;
    font-size: 18px;
    text-align: left;
    font-weight: 600;
    line-height: 1.4;
    color: #000;
  }

  .center-section {
    order: 2;
    align-self: center;
    margin: 20px 0;
  }

  .observation-hypothesis {
    font-size: 20px;
    font-weight: bold;
  }

  .research-cards {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .research-card {
    height: 327px;
    border-radius: 13px;
  }




  .bubbles-container {
    border-radius: 16px;
  }

  .bubble.small {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }

  .bubble.medium {
    width: 120px;
    height: 120px;
    font-size: 14px;
  }

  .bubble.large {
    width: 160px;
    height: 160px;
    font-size: 16px;
  }

  .bubble.extra-large {
    width: 200px;
    height: 200px;
    font-size: 18px;
    line-height: 1.1;
  }

  /* 移动端气泡布局优化 */
  .bubbles-container {
    position: relative;
    overflow: visible;
    /* 允许气泡稍微超出容器边界 */
  }

  .bubble {
    /* 确保气泡不会因为容器尺寸变化而变形 */
    flex-shrink: 0;
    /* 优化触摸体验 */
    touch-action: none;
    /* 减少动画复杂度以提升性能 */
    will-change: transform, opacity;
  }

  /* 移动端特定的气泡颜色和边框调整 */
  .bubble.blue {
    border-width: 2px;
  }

  .bubble.white {
    border-width: 2px;
  }

  .bubble.purple {
    border-width: 2px;
  }

  .bubble.pink {
    border-width: 2px;
  }

  .bubble.green {
    border-width: 2px;
  }

  .bubble.black {
    border-width: 2px;
  }

  /* 新闻部分 */
  .news-section {
    padding: 80px 0;
  }

  .section-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 32px;
    font-weight: bold;
    line-height: 1.2;
  }

  .read-all-link {
    font-size: 18px;
    color: #000;
    text-decoration: underline;
  }

  .read-all-link:hover {
    color: #c0c0c0;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* 非轮播区域的新闻卡片样式 */
  .news-section .news-card {
    padding: 24px;
    height: auto;
    min-height: 520px;
    border-radius: 24px;
    border: 2px solid #000;
    background: #fff;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
  }

  /* 轮播图中的新闻卡片样式 - 移除min-height限制 */
  .hero-carousel .news-card {
    padding: 0;
    min-height: unset;
    height: 100%;
  }

  .news-image {
    height: 250px;
    margin-bottom: 20px;
    border-radius: 16px;
    overflow: hidden;
  }

  .news-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #000;
  }

  .news-date {
    font-size: 16px;
    margin-bottom: 30px;
    opacity: 0.8;
  }

  .btn-news {
    padding: 16px 32px;
    font-size: 18px;
    background: #000;
    color: #fff;
    border-radius: 16px;
    align-self: flex-start;
  }

  /* 项目部分 */
  .project-section {
    padding: 60px 0;
    background: linear-gradient(135deg,
        rgba(158, 232, 255, 0.1) 0%,
        rgba(160, 232, 253, 0.15) 25%,
        rgba(158, 232, 255, 0.2) 50%,
        rgba(160, 232, 253, 0.15) 75%,
        rgba(158, 232, 255, 0.1) 100%);
    position: relative;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .project-accordion {
    margin-bottom: 0;
  }

  .project-item {
    display: none;
    /* 隐藏手风琴样式的项目标题 */
  }

  .accordion-card {
    margin-top: 0;
    margin-bottom: 0;
    background: #fff;
    border: 2px solid #000;
    border-radius: 24px;
    padding: 24px;
    box-shadow: none;
    transform: none;
    position: static;
  }

  .accordion-card.expanded-project {
    margin-top: 0;
    background: #fff;
    border: 2px solid #000;
    transform: none;
    box-shadow: none;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
  }





  .project-title {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.35;
    margin-bottom: 16px;
    color: #000;
  }



  .accordion-card .project-content {
    display: flex !important;
    flex-direction: column !important;
    order: 2;
  }

  .accordion-card .project-description {
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

  .accordion-card .project-description ul {
    margin-top: 16px;
    padding-left: 24px;
  }

  .accordion-card .project-description ul li {
    font-size: 18px !important;
    line-height: 1.57 !important;
    margin-bottom: 8px !important;
    color: #000 !important;
  }

  /* 平板端富文本标题样式 */
  .accordion-card .project-description h1,
  .accordion-card .project-description h2,
  .accordion-card .project-description h3,
  .accordion-card .project-description .ql-editor h1,
  .accordion-card .project-description .ql-editor h2,
  .accordion-card .project-description .ql-editor h3,
  .accordion-card .project-description div h1,
  .accordion-card .project-description div h2,
  .accordion-card .project-description div h3,
  .accordion-card .project-description p h1,
  .accordion-card .project-description p h2,
  .accordion-card .project-description p h3 {
    font-family: 'Sora', sans-serif !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    line-height: 1.3 !important;
    color: black !important;
    margin: 0 0 8px 0 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    cursor: pointer !important;
    transition: color 0.2s ease !important;
  }

  .accordion-card .project-description h1:hover,
  .accordion-card .project-description h2:hover,
  .accordion-card .project-description h3:hover,
  .accordion-card .project-description .ql-editor h1:hover,
  .accordion-card .project-description .ql-editor h2:hover,
  .accordion-card .project-description .ql-editor h3:hover,
  .accordion-card .project-description div h1:hover,
  .accordion-card .project-description div h2:hover,
  .accordion-card .project-description div h3:hover,
  .accordion-card .project-description p h1:hover,
  .accordion-card .project-description p h2:hover,
  .accordion-card .project-description p h3:hover {
    color: #0066cc !important;
  }

  .accordion-card .project-image {
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

  .accordion-card .project-image img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .btn-project {
    padding: 6px 14px !important;
    font-size: 12px !important;
    background: #000 !important;
    color: #fff !important;
    border-radius: 8px !important;
    align-self: flex-start !important;
    order: 3 !important;
    border: none;
  }

  .project-arrow {
    display: none;
    /* 隐藏箭头 */
  }

  /* 确保所有项目卡片都显示 */
  .project-accordion {
    display: block;
  }

  .accordion-card {
    display: block;
  }

  /* 移动端禁用过渡动画 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: none;
  }

  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 1;
    transform: translateY(0);
  }

  /* 关注我们 */
  .follow-section {
    padding: 80px 0 0;
    background: #fff;
  }

  .follow-footer {
    padding: 30px 0 0 !important;
  }

  .section-header {
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 32px;
    font-weight: bold;
    line-height: 1.2;
  }

  .follow-cards {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .follow-card {
    padding: 16px;
    padding-bottom: 60px;
    height: auto;
    min-height: 180px;
    position: relative;
    background: #fff;
    border: 2px solid #000;
    border-radius: 16px;
    box-shadow: none;
  }

  .follow-card::before {
    display: none;
  }

  .dh {
    width: 42px;
    height: 42px;
    margin-right: 14px;
  }

  .follow-quote {
    font-size: 16px;
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .follow-text {
    font-size: 16px;
    line-height: 1.6;
  }

  .follow-date {
    font-size: 14px;
    margin-bottom: 8px;
    margin-left: 56px;
    /* 与dh宽度对齐 */
    opacity: 0.8;
  }

  .follow-platforms {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .follow-platform {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 0;
  }

  .platform-name {
    font-size: 18px;
    font-weight: bold;
  }

  .platform-icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  .platform-icon.wechat {
    background-color: #00c327;
  }

  .platform-icon.xiaohongshu {
    background-color: #fc3251;
  }

  .arrowbox {
    width: 115px;
    height: 115px;
    bottom: 0;
    right: 0;
  }

  .arrowbox .arrow-icon {
    font-size: 32px;
  }

  .arrowbox:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }


}

@media (max-width: 480px) {
  .container {
    max-width: 95% !important;
  }

  /* 英雄区域 */
  .hero-title {
    font-size: 32px;
    line-height: 1.1;
  }

  .hero-greeting {
    font-size: 16px;
  }

  .hero-description {
    font-size: 16px;
    line-height: 1.5;
  }

  .btn {
    font-size: 16px;
    padding: 14px 28px;
  }

  .circle-container {
    height: 300px;
    padding: 15px;
  }

  .circle {
    width: 110px;
    height: 110px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }

  /* 小屏幕圆形位置优化 */
  .circle-1 {
    top: 5px;
    left: 15px;
  }

  .circle-2 {
    top: 5px;
    right: 15px;
  }

  .circle-3 {
    bottom: 5px;
    left: 15px;
  }

  .circle-4 {
    bottom: 5px;
    right: 15px;
  }

  /* 小屏幕圆形图片优化 */
  .circle>img {
    width: 67%;
    height: 67%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  .circle:active>img {
    transform: scale(0.9);
  }

  /* 合作伙伴 */
  .partners-label {
    font-size: 18px;
  }

  .partner-logo {
    height: 32px;
  }

  /* 研究方向 */
  .research-title {
    font-size: 28px;
  }

  .research-description {
    font-size: 16px;
  }

  .side-label {
    font-size: 18px;
  }

  .observation-hypothesis {
    font-size: 16px;
  }

  .research-card {
    height: 250px;
  }

  /* 新闻部分 */
  .section-title {
    font-size: 28px;
  }

  .read-all-link {
    font-size: 16px;
  }

  /* 非轮播区域的新闻卡片样式 */
  .news-section .news-card {
    padding: 20px;
    min-height: 460px;
  }

  /* 轮播图中的新闻卡片样式 - 移除min-height限制 */
  .hero-carousel .news-card {
    padding: 0;
    min-height: unset;
    height: 100%;
  }

  .news-image {
    height: 220px;
  }

  .news-title {
    font-size: 18px;
    line-height: 1.4;
  }

  .news-date {
    font-size: 14px;
  }

  .btn-news {
    font-size: 16px;
    padding: 14px 28px;
  }

  /* 项目部分 */
  .project-title {
    font-size: 24px;
    line-height: 1.3;
  }

  .accordion-card .project-description {
    font-size: 16px !important;
    line-height: 1.5 !important;
    display: -webkit-box !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .accordion-card .project-description ul li {
    font-size: 16px !important;
    line-height: 1.5 !important;
  }

  /* 手机端富文本标题样式 */
  .accordion-card .project-description h1,
  .accordion-card .project-description h2,
  .accordion-card .project-description h3,
  .accordion-card .project-description .ql-editor h1,
  .accordion-card .project-description .ql-editor h2,
  .accordion-card .project-description .ql-editor h3,
  .accordion-card .project-description div h1,
  .accordion-card .project-description div h2,
  .accordion-card .project-description div h3,
  .accordion-card .project-description p h1,
  .accordion-card .project-description p h2,
  .accordion-card .project-description p h3 {
    font-family: 'Sora', sans-serif !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    line-height: 1.3 !important;
    color: black !important;
    margin: 0 0 6px 0 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    cursor: pointer !important;
    transition: color 0.2s ease !important;
  }

  .accordion-card .project-description h1:hover,
  .accordion-card .project-description h2:hover,
  .accordion-card .project-description h3:hover,
  .accordion-card .project-description .ql-editor h1:hover,
  .accordion-card .project-description .ql-editor h2:hover,
  .accordion-card .project-description .ql-editor h3:hover,
  .accordion-card .project-description div h1:hover,
  .accordion-card .project-description div h2:hover,
  .accordion-card .project-description div h3:hover,
  .accordion-card .project-description p h1:hover,
  .accordion-card .project-description p h2:hover,
  .accordion-card .project-description p h3:hover {
    color: #0066cc !important;
  }

  .accordion-card .project-image {
    height: 160px !important;
  }

  .btn-project {
    padding: 8px 18px !important;
    font-size: 12px !important;
  }

  .accordion-card {
    padding: 20px !important;
  }

  /* 关注我们 */
  .follow-card {
    padding: 16px;
    padding-bottom: 50px;
    min-height: 180px;
  }

  .dh {
    width: 40px;
    height: 40px;
  }

  .follow-quote {
    font-size: 16px;
    line-height: 1.6;
  }

  .follow-text {
    font-size: 16px;
    line-height: 1.6;
  }

  .follow-date {
    font-size: 14px;
    margin-left: 56px;
  }

  .platform-name {
    font-size: 18px;
  }

  .platform-icon {
    width: 32px;
    height: 32px;
  }

  .arrowbox {
    width: 70px;
    height: 70px;
    bottom: 0;
    right: 0;
  }

  .arrowbox .arrow-icon {
    font-size: 22px;
  }

  /* 页脚 */
  .social-links {
    gap: 60px;
    padding: 40px 0;
  }

  .social {
    width: 36px;
    height: 36px;
  }

  .social img {
    right: 9px;
    bottom: 9px;
    width: 18px;
    height: 18px;
  }

  .footer {
    padding: 40px 0;
  }

  .footer-content {
    padding: 40px 0;
    gap: 24px;
  }

  .footer-logo-icon {
    height: 50px;
  }

  .footer-title {
    font-size: 18px;
  }

  .footer-links a {
    font-size: 16px;
  }

  .footer-address {
    font-size: 16px;
    line-height: 1.6;
  }

  /* 气泡优化 */
  .bubble.small {
    width: 50px;
    height: 50px;
    font-size: 10px;
  }

  .bubble.medium {
    width: 90px;
    height: 90px;
    font-size: 12px;
  }

  .bubble.large {
    width: 120px;
    height: 120px;
    font-size: 14px;
  }

  .bubble.extra-large {
    width: 150px;
    height: 150px;
    font-size: 16px;
    line-height: 1.0;
  }

  /* 气泡重新布局 */
  .bubbles-container .bubble:nth-child(1) {
    left: 20% !important;
    bottom: 67% !important;
  }

  .bubbles-container .bubble:nth-child(2) {
    left: 5% !important;
    bottom: 40% !important;
  }

  .bubbles-container .bubble:nth-child(3) {
    left: 55% !important;
    bottom: 30% !important;
  }

  .bubbles-container .bubble:nth-child(4) {
    left: 8% !important;
    bottom: 80% !important;
  }

  .bubbles-container .bubble:nth-child(5) {
    left: 75% !important;
    bottom: 10% !important;
  }

  .bubbles-container .bubble:nth-child(6) {
    left: 88% !important;
    bottom: 5% !important;
  }

  .bubbles-container .bubble:nth-child(7) {
    left: 35% !important;
    bottom: 5% !important;
  }
}

.container {
  max-width: 65%;
  margin: 0 auto;
  padding: 10px 20px;
}

.social {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #d7ff39;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #a1e8fe;
  border-radius: 50%;
  top: -4px;
  right: -4px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.social:hover {
  transform: translateY(-2px);
}

.social:hover::after {
  opacity: 1;
  transform: scale(1);
}

.social img {
  object-fit: contain;
  position: absolute;
  right: 11px;
  bottom: 11px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 150px;
}

/* Follow footer (social icons under Follow Us) */
.follow-footer {
  background: #f8f9fa;
  /* unify with follow-section */
  padding: 30px 0 80px;
}

.follow-social-links {
  display: flex;
  justify-content: center;
  gap: 150px;
}

.follow-social {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #d7ff39;
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follow-social:hover {
  transform: translateY(-2px);
}

.follow-social img {
  object-fit: contain;
  position: absolute;
  right: 11px;
  bottom: 11px;
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
  margin-left: 2px;
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

/* 页脚 */
.footer {
  color: #000;
  padding: 80px 0;
  border-top: none;
}

.footer-content {
  padding: 100px 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 80px;
  align-items: start;
}

.footer-logo-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-logo-icon {
  height: 40px;
}

.footer-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #888;
  text-transform: uppercase;
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: #000;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
}

.footer-address {
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  color: #000;
}

/* 移动端触摸优化 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

@media (max-width: 768px) {

  /* unify background with follow-section on mobile */
  .follow-footer {
    background: #fff;
  }

  .follow-social-links {
    gap: 60px;
    padding: 40px 0;
  }

  .follow-social {
    width: 36px;
    height: 36px;
    background-color: #d7ff39;
    border-radius: 50%;
  }

  .follow-social img {
    right: 9px;
    bottom: 9px;
    width: 18px;
    height: 18px;
  }

  .social-links {
    gap: 120px;
    padding: 80px 0;
    justify-content: center;
  }

  .social {
    width: 44px;
    height: 44px;
    background-color: #d7ff39;
    border-radius: 50%;
  }

  .social img {
    right: 11px;
    bottom: 11px;
    width: 22px;
    height: 22px;
  }

  .footer {
    padding: 80px 0;
    background-image: url('../assests/home/footerbg.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 100px 0;
  }

  .footer-logo-section {
    margin-bottom: 40px;
  }

  .footer-logo-icon {
    height: 60px;
  }

  .footer-title {
    font-size: 20px;
    margin-bottom: 16px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
  }

  .footer-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
    list-style: none;
    padding: 0;
  }

  .footer-links a {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    text-decoration: none;
  }

  .footer-address {
    font-size: 18px;
    line-height: 1.7;
    font-weight: 600;
    color: #000;
    margin-top: 24px;
  }

  /* 特殊处理MEET US部分 */
  .footer-content .footer-section:last-child .footer-title {
    margin-bottom: 30px;
  }

  .footer-content .footer-section:last-child .footer-links {
    display: block;
  }
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
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
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
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.image-preview-title {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 20px;
  color: #000000;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e0e0e0;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #666666;
}

.image-preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  max-height: calc(90vh - 80px);
  overflow: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Mobile responsive for image preview */
@media (max-width: 768px) {
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
}

@media (max-width: 480px) {
  .follow-social-links {
    gap: 40px;
    padding: 30px 0;
  }

  .follow-social {
    width: 32px;
    height: 32px;
  }

  .follow-social img {
    right: 8px;
    bottom: 8px;
    width: 16px;
    height: 16px;
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
}

/* 轮播图样式 - 卡片式设计 */
.hero-section {
  width: 100%;
  height: 50rem;
  min-height: 43.75rem;
  overflow: hidden;
  position: relative;
  background: transparent;
  padding: 6rem 0 7rem 0;
  box-sizing: border-box;
}

.hero-carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
  max-width: 65%;
  margin: 0 auto;
  transform-origin: center;
}

.hero-carousel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-slide {
  min-width: 33.333%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  padding: 0 0.75rem;
  /* 留出左右间距 */
  box-sizing: border-box;
  /* 确保padding不影响宽度计算 */
}


.item-card {
  width: 100%;
  height: 90%;
  margin: 0 0px;
}

.news-card {
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: transparent;
}



.card-image-container {
  width: 100%;
  height: 65%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 1.25rem 1.25rem 0 0;
  overflow: hidden;
  background-color: #f8f9fa;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.3s ease;
}

.card-image-container:hover .card-image {
  transform: scale(1.03);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}



.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 38%;
  padding: 1.25rem 1.5rem 1.5rem;
  color: black;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 0 0 1.25rem 1.25rem;
  font-weight: normal;
  z-index: 2;
}

.card-header {
  margin-bottom: 0.5rem;
}

.card-main-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: black;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 主标题最多显示2行 */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  transition: color 0.2s ease;
}

.card-main-title:hover {
  color: #0066cc;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  /* 允许在容器内收缩，避免溢出 */
  flex: 1 1 auto;
  /* 占据剩余空间 */
}



.card-text.no-title .card-title {
  -webkit-line-clamp: 4;
  /* 没有标题时显示更多行 */
  line-clamp: 4;
  word-break: break-word;
  /* 在单词边界处换行 */
  hyphens: auto;
  /* 自动连字符 */
}

.card-title {
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  color: black;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* 统一最多显示4行，避免不齐 */
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  /* 在单词边界处换行 */
  hyphens: auto;
  /* 自动连字符 */
  margin-bottom: -8px;
}

.read-more-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: black;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
  align-self: flex-start;
  flex: 0 0 auto;
  /* 固定底部区域 */
  transition: transform 0.2s ease, color 0.2s ease;
}

.read-more-link .arrow-icon {
  transition: transform 0.2s ease;
}

.read-more-link:hover {
  transform: translateY(-1px) scale(1.02);
}

.read-more-link:hover .arrow-icon {
  transform: translateX(2px);
}




.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
}



/* 导航点 */
.carousel-dots {
  position: absolute;
  right: 2.5rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.carousel-dot {
  width: 2.5rem;
  height: 0.375rem;
  border-radius: 0.15rem;
  border: 1px solid rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
}



.carousel-dot.active {
  background: #000000;
  border-color: #000000;
  width: 3.5rem;
}


/* 轮播区域针对481-768px的中等屏幕优化 - 双列显示 */
@media (min-width: 481px) and (max-width: 768px) {
  .hero-section {
    height: 750px;
    /* 增加轮播高度 从650px增加到750px */
    padding: 80px 0 120px 0;
  }

  .hero-carousel-container {
    max-width: 90% !important;
    height: 100%;
    transform: none !important;
    position: static !important;
    margin: 0 auto;
  }

  .hero-carousel-container .research-title {
    margin-top: 0;
    font-size: 28px;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }

  .hero-carousel {
    height: 550px !important;
    /* 增加轮播内容高度 从450px增加到550px */
    overflow: hidden !important;
    position: relative;
  }

  .carousel-slide {
    min-width: 50%;
    /* 每屏2张 */
    height: 100% !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    box-sizing: border-box;
  }

  .carousel-track {
    height: 100% !important;
    display: flex;
  }

  .item-card {
    width: 100%;
    max-width: 100%;
    height: 510px;
    /* 增加卡片高度 从410px增加到510px */
    margin: 0;
    position: relative;
    box-sizing: border-box;
  }

  .card-image-container {
    height: 65%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
  }

  .card-content {
    height: 35%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 0 0 16px 16px;
  }

  .card-header {
    margin-bottom: 8px;
  }

  .card-main-title {
    font-size: 20px;
    /* 增加主标题字号 从18px增加到20px */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  :deep(.card-title h1),
  :deep(.card-title h2),
  :deep(.card-title h3) {
    font-size: 20px !important;
    /* 保持与主标题一致的字号 */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1 !important;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  .card-title {
    font-size: 17px;
    /* 增加内容字号，但保持小于标题 从16px增加到17px */
    line-height: 1.3;
    -webkit-line-clamp: 3;
    /* 内容限制为3行 */
    line-clamp: 3;
  }

  .card-text.no-title .card-title {
    -webkit-line-clamp: 4;
    /* 没有标题时显示更多行 */
    line-clamp: 4;
    word-break: break-word;
    /* 在单词边界处换行 */
    hyphens: auto;
    /* 自动连字符 */
  }

  .read-more-link {
    font-size: 16px;
    margin-top: 8px;
  }

  .arrow-icon {
    width: 14px;
    height: 14px;
  }

  .carousel-dots {
    left: 50%;
    transform: translateX(-50%);
    gap: 8px;
    position: absolute !important;
    z-index: 10;
  }

  .carousel-dot {
    width: 20px;
    height: 6px;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .carousel-dot.active {
    width: 32px;
    background: #000000;
    border-color: #000000;
  }
}

/* 轮播区域针对480px以下的小屏幕优化 - 单列显示 */
@media (max-width: 480px) {
  .hero-section {
    height: 680px;
    /* 增加轮播高度 从580px增加到680px */
    padding: 60px 0 100px 0;
  }

  .hero-carousel-container {
    max-width: 95% !important;
    height: 100%;
    transform: none !important;
    position: static !important;
    margin: 0 auto;
    padding: 0 20px;
  }

  .hero-carousel-container .research-title {
    margin-top: 0;
    font-size: 28px;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
  }

  .hero-carousel {
    height: 520px !important;
    /* 增加轮播内容高度 从420px增加到520px */
    overflow: hidden !important;
    position: relative;
  }

  .carousel-slide {
    min-width: 100%;
    /* 每屏1张 */
    height: 100% !important;
    display: flex !important;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    box-sizing: border-box;
  }

  .carousel-track {
    height: 100% !important;
    display: flex;
  }

  .item-card {
    width: 100%;
    max-width: 100%;
    height: 480px;
    /* 增加卡片高度 从380px增加到480px */
    margin: 0;
    position: relative;
    box-sizing: border-box;
  }

  .card-image-container {
    height: 65%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 14px 14px 0 0;
  }

  .card-content {
    height: 35%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    box-sizing: border-box;
    border-radius: 0 0 14px 14px;
  }

  .card-header {
    margin-bottom: 6px;
  }

  .card-main-title {
    font-size: 18px;
    /* 增加主标题字号 从16px增加到18px */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  :deep(.card-title h1),
  :deep(.card-title h2),
  :deep(.card-title h3) {
    font-size: 18px !important;
    /* 保持与主标题一致的字号 */
    font-weight: 600;
    line-height: 1.3;
    -webkit-line-clamp: 1 !important;
    /* 手机端标题限制为一行 */
    line-clamp: 1;
  }

  .card-title {
    font-size: 1.1rem;
    /* 保持内容字号适中，小于标题 */
    line-height: 1.3;
    -webkit-line-clamp: 3;
    /* 内容限制为3行 */
    line-clamp: 3;
  }

  .card-text.no-title .card-title {
    -webkit-line-clamp: 4;
    /* 没有标题时显示更多行 */
    line-clamp: 4;
    word-break: break-word;
    /* 在单词边界处换行 */
    hyphens: auto;
    /* 自动连字符 */
  }

  .read-more-link {
    font-size: 16px;
    margin-top: 8px;
  }

  .card-text {
    gap: 8px;
  }

  .arrow-icon {
    width: 12px;
    height: 12px;
  }

  .carousel-dots {
    left: 50%;
    transform: translateX(-50%);
    gap: 6px;
    position: absolute !important;
    z-index: 10;
  }

  .carousel-dot {
    width: 18px;
    height: 5px;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .carousel-dot.active {
    width: 28px;
    background: #000000;
    border-color: #000000;
  }
}


/* 桌面端默认样式 - 使用媒体查询确保不覆盖移动端设置 */
@media (min-width: 769px) {
  :deep(.card-title h1) {
    font-family: 'Sora', sans-serif;
    font-size: 1.125rem !important;
    font-weight: 600;
    line-height: 1.4;
    color: black;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 主标题最多显示2行 */
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-bottom: 0.5rem;
  }

  :deep(.card-title h2) {
    font-family: 'Sora', sans-serif;
    font-size: 1.125rem !important;
    font-weight: 600;
    line-height: 1.4;
    color: black;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 主标题最多显示2行 */
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-bottom: 0.5rem;
  }
}
</style>
