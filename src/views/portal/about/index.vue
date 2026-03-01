<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { Motion } from "motion-v";
const Header = defineAsyncComponent(() => import('../components/Header.vue'));
const Footer = defineAsyncComponent(() => import('../components/Footer.vue'));
const BackToTop = defineAsyncComponent(() => import('../components/BackToTop.vue'));
const MemberCard = defineAsyncComponent(() => import('../components/MemberCard.vue'));
const Marquee = defineAsyncComponent(() => import('../components/Marquee.vue'));
const ReviewCard = defineAsyncComponent(() => import('../components/ReviewCard.vue'));
import  supabase  from "@/supabase/supabase";
import { useMessage } from 'naive-ui';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';

const router = useRouter();
const appStore = useAppStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);

const navigateTo = (path: string, event: Event) => {
  event.preventDefault();
  router.push(path);
};

defineOptions({
  name: 'PortalAbout'
});

// 表单数据
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  message: ''
});



// Staff 数据
interface MemberItem {
  name: string;
  name_cn?: string;
  avatar?: string;
  ct_avatar?: string;
  description?: string;
  description_cn?: string;
  link_url?: string;
  describe?: string;
  describe_cn?: string;
  [key: string]: any;
}

const staff = ref<MemberItem[]>([]);
// Student 数据
const students = ref<MemberItem[]>([]);
const professors = ref<MemberItem[]>([]);
const alumni = ref<MemberItem[]>([]);

const descriptionData = ref<any>({});



// 打字机效果变量
const animatedDescription = ref('');
let typewriterTimer: NodeJS.Timeout | null = null;

// 基于语言的本地化描述（about/about_cn）
const localizedAboutDescription = computed(() => {
  const isZhCN = appStore.locale === 'zh-CN';
  const data = descriptionData.value || {};
  return isZhCN ? (data.about_cn || data.about || '') : (data.about || data.about_cn || '');
});

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
  }, 40); // 稍快一点的速度
}

// 监听本地化后的描述变化（含语言切换与数据刷新）
watch(localizedAboutDescription, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      startTypewriter(newValue);
    }, 600);
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

// 清理函数
onUnmounted(() => {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
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
});


const getStaff = async () => {
  const { data } = await supabase.from('member').select('*, name_cn, description_cn').eq('role', 'Staff').order('sort', { ascending: true });
  staff.value = (data || []) as MemberItem[];
};

const getStudent = async () => {
  const { data } = await supabase.from('member').select('*, name_cn, description_cn').eq('role', 'Student').order('sort', { ascending: true });
  students.value = (data || []) as MemberItem[];
};
  
const getProfessor = async () => {
  const { data } = await supabase.from('member').select('*, name_cn, description_cn').eq('role', 'Professor').order('sort', { ascending: true });
  professors.value = (data || []) as MemberItem[];
};

const getAlumni = async () => {
  const { data } = await supabase.from('alumni').select('*, name_cn, describe_cn');
  alumni.value = (data || []) as MemberItem[];
};



async function getDescription() {
  const { data, error } = await supabase.from('description').select('*').eq('id', 1).single();
  console.log(data,"description");
  descriptionData.value = data;
  return data;
}


onMounted(() => {
  // 初始化 rem 根字号并监听窗口变化
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  
  getStaff();
  getStudent();
  getProfessor();
  getAlumni();
  getDescription();

  // 切回标签页或窗口获得焦点时刷新数据
  const refreshAboutData = async () => {
    try {
      await Promise.all([getStaff(), getStudent(), getProfessor(), getAlumni(), getDescription()]);
    } catch (err) {
      console.error('Failed to refresh about data after visibility/focus:', err);
    }
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') refreshAboutData();
  };
  const handleWindowFocus = () => refreshAboutData();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('pageshow', handleWindowFocus);

  // 卸载时清理
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange as any);
    window.removeEventListener('focus', handleWindowFocus as any);
    window.removeEventListener('pageshow', handleWindowFocus as any);
  });
});



// Message字符限制
const MAX_MESSAGE_LENGTH = 500;

// 计算message的字符数和进度
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

// 提交表单
const submitForm = async () => {
  console.log('提交表单:', formData.value);
  // 这里可以添加实际的表单提交逻辑
  //校验一下非空和邮箱的正则
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
  // 提交到supabase
  const { data, error } = await supabase.from('message').insert({
    first_name: formData.value.firstName,
    last_name: formData.value.lastName,
    email_address: formData.value.email,
    message: formData.value.message
  });
  if (error) {
    message.error('Error submitting form');
  } else {
    // 清空表单
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      message: ''
    };
    // 弹出提示
    message.success('Message submitted successfully, we will contact you soon.');
  }
};

// Reviews data
const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
];

// let marqueeData = ref([
//   ...professors.value,
//   ...students.value,
//   ...staff.value,
// ]);

const imgList = [
  'https://avatar.vercel.sh/jack',
  'https://avatar.vercel.sh/jill',
  'https://avatar.vercel.sh/john',
  'https://avatar.vercel.sh/jane',
  'https://avatar.vercel.sh/jenny',
]
const marqueeData = computed(() => {
  const isZhCN = appStore.locale === 'zh-CN';
  let data = alumni.value.map(item =>{
    let randomIndex = Math.floor(Math.random() * imgList.length);
    return {
      ...item,
      avatar: imgList[randomIndex],
      // 根据语言选择显示的姓名和描述
      displayName: isZhCN ? (item.name_cn || item.name) : item.name,
      displayDescription: isZhCN ? (item.describe_cn || item.describe) : item.describe
    }
  })
  return data;
});



// // Split reviews into two rows
// const firstRow = ref(marqueeData.value.slice(0, marqueeData.value.length / 2));
// const secondRow = ref(marqueeData.value.slice(marqueeData.value.length / 2, marqueeData.value.length / 2));

const firstRow = computed(() => {
  return marqueeData.value.slice(0, marqueeData.value.length / 2);
});

const secondRow = computed(() => {
  return marqueeData.value.slice(marqueeData.value.length / 2);
});
</script>

<template>
  <div class="about-page" :class="{ 'is-dark': isDark }">
    <Header  />
    <!-- Header Section -->
    <section class="header-section">
      <div class="container">
        <Motion 
          as="h1" 
          class="main-title"
          :initial="{ opacity: 0, y: 50 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: 'easeOut' }"
        >
          {{ $t('portal.about.teamTitle') }}
        </Motion>
        <Motion 
          as="p" 
          class="main-description"
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2, duration: 0.8, ease: 'easeOut' }"
        >
          <span class="typewriter-text" :data-text="localizedAboutDescription" v-if="localizedAboutDescription">
            {{ animatedDescription }}
          </span>
        </Motion>
      </div>
    </section>

    <!-- Professor Section -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('portal.about.professor') }}</h2>
        <div class="member-grid member-grid--fixed">
          <MemberCard 
            v-for="professor in professors"
            :key="professor.name"
            :name="professor.name || ''"
            :name_cn="professor.name_cn"
            :avatar="professor.avatar || ''"  
            :ctavatar="professor.ct_avatar || ''"
            :description="professor.description || ''"
            :description_cn="professor.description_cn"
            :link="professor.link_url || ''"
            :showWindow="true"
            type="professor"
          />
        </div>
      </div>
    </section>

        <!-- Staff Section -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('portal.about.staff') }}</h2>
        <div class="member-grid">
          <MemberCard
            v-for="member in staff"
            :key="member.name"
            :name="member.name || ''"
            :name_cn="member.name_cn"
            :avatar="member.avatar || ''"
            :ctavatar="member.ct_avatar || ''"
            :description="member.description || ''"
            :description_cn="member.description_cn"
            :link="member.link_url || ''"
             :showWindow="false"
            type="staff"
          />
        </div>
      </div>
    </section>

        <!-- Student Section -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">{{ $t('portal.about.student') }}</h2>
        <div class="member-grid">
          <MemberCard
            v-for="student in students"
            :key="student.name"
            :name="student.name || ''"
            :name_cn="student.name_cn"
            :avatar="student.avatar || ''"
            :ctavatar="student.ct_avatar || ''"
            :description="student.description || ''"
            :description_cn="student.description_cn"
            :link="student.link_url || ''"
             :showWindow="false"
            type="student"
          />
        </div>
      </div>
    </section>

    <!-- Alumni Section -->
    <section class="section alumni-section">
      <div class="container">
        <h2 class="section-title">{{ $t('portal.about.alumni') }}</h2>
      </div>
      <div
    class="relative flex  w-full flex-col items-center justify-center overflow-hidden  "
  >
    <!-- First Marquee -->
    <Marquee
      pause-on-hover
      class="[--duration:100s]"
    >
      <ReviewCard
        v-for="review in firstRow"
        :key="review.name"
        :img="review.avatar"
        :name="review.displayName || review.name"
        username=""
        :body="review.displayDescription || review.describe || ''"
      />
    </Marquee>

    <!-- Second Marquee (reverse) -->
    <Marquee
      reverse
      pause-on-hover
      class="[--duration:100s]"
    >
      <ReviewCard
        v-for="review in secondRow"
        :key="review.name"
        :img="review.avatar"
        :name="review.displayName || review.name"
        username=""
        :body="review.displayDescription || review.describe || ''"
      />
    </Marquee>

    <!-- Left Gradient -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r"
      :class="isDark ? 'from-[#121212]' : 'from-white'"
    ></div>

    <!-- Right Gradient -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l"
      :class="isDark ? 'from-[#121212]' : 'from-white'"
    ></div>
  </div>
    </section>

    <!-- Contact Section -->
    <!-- <section id="contact" class="contact-section">
      <div class="container">
        <h2 class="section-title">{{ $t('portal.about.contact.title') }}</h2>
        <div class="contact-container">
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
                      :class="{ 
                        'progress-warning': messageProgress.percentage > 80,
                        'progress-error': messageProgress.isOverLimit 
                      }"
                    ></div>
                  </div>
                  <div class="character-count" :class="{ 'count-error': messageProgress.isOverLimit }">
                    {{ messageProgress.currentLength }} / {{ messageProgress.maxLength }}
                  </div>
                </div>
              </div>
              <button type="submit" class="submit-button">
                {{ $t('portal.about.contact.form.submit') }}
              </button>
            </form>
          </div>

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
    </section> -->
    <Footer />
    
    <!-- 返回顶部按钮 -->
    <BackToTop />
  </div>
</template>

<style scoped>
/* 去除滚动条 */
::-webkit-scrollbar {
  display: none;
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
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 当打字机完成后隐藏光标 */
.typewriter-text.completed::after {
  display: none;
}

.header{  
  border-bottom: none;
  background-color: #f0f0f0;
}

.header.is-dark {
  background:#1e1e1e !important;
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
.about-page {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Sora', sans-serif;
  font-weight: 400;
  /* 统一卡片列宽（使用rem单位） */
  --card-width: 14rem;
  /* 让 Header 继承与顶部 section 一致的背景色 */
  --portal-header-bg: #f0f0f0;
}

.container {
  max-width: 87.5rem;
  margin: 0 auto;
}

/* 768px以上的PC端设置宽度 */
@media (min-width: 481px) {
  .container {
    width: 65%;
  }
}

.header-section {
  background: #f0f0f0;
  padding: 5rem 0 4.375rem 0;
  text-align: left;
}

/* 使 About 页头部区域与 Research 页保持一致的容器宽度与内边距 */
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

.section {
  padding: 1.5rem 0 1rem 0;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 2.5rem;
  line-height: normal;
}

.member-grid {
  display: grid;
  gap: 1.875rem 1.5625rem;
  justify-content: flex-start;
}

/* 768px以上的PC端显示5列自适应 */
@media (min-width: 769px) {
  .member-grid {
    grid-template-columns: repeat(5, 1fr);
    justify-content: stretch;
  }
}

/* 移动端显示单列 */
@media (max-width: 768px) {
  .member-grid {
    grid-template-columns: repeat(2, 1fr);
    justify-content: stretch;
  }
}

/* 教授区样式 */
@media (min-width: 769px) {
  .member-grid--fixed {
    grid-template-columns: repeat(auto-fit, 14rem);
    justify-content: flex-start;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .member-grid--fixed {
    grid-template-columns: 1fr;
    justify-content: center;
    max-width: 18rem;
    margin: 0 auto;
  }
}

.alumni-section {
  background: #ffffff;
  padding: 1.5rem 0 1.5rem 0;
}

.alumni-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: flex-start;
  align-items: flex-start;
}

.alumni-tag {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.375rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  transition: all 0.3s ease;
  height: 4.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.alumni-tag:nth-child(3) {
  background: #d7ff39;
}

.alumni-tag:nth-child(5) {
  background: #c8bbf1;
}

.alumni-tag:nth-child(7) {
  background: #9ee8ff;
}

.alumni-tag:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.3125rem 0.9375rem rgba(0, 0, 0, 0.1);
}

.contact-section {
  padding: 5rem 0 2.5rem 0;
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
.about-page.is-dark {
  background: #121212;
  --portal-header-bg: #1e1e1e;
}

.about-page.is-dark .header-section {
  background: #1e1e1e;
}

.about-page.is-dark .main-title {
  color: #e0e0e0;
}

.about-page.is-dark .main-description {
  color: #e0e0e0;
}

.about-page.is-dark .typewriter-text::after {
  color: #e0e0e0;
}

.about-page.is-dark .section {
  background: #121212;
}

.about-page.is-dark .section-title {
  color: #e0e0e0;
}

.about-page.is-dark .alumni-section {
  background: #121212;
}

.about-page.is-dark .alumni-tag {
  background: #2a2a2a;
  color: #e0e0e0;
}

.about-page.is-dark .alumni-tag:hover {
  box-shadow: 0 0.3125rem 0.9375rem rgba(0, 0, 0, 0.3);
}

.about-page.is-dark .contact-section {
  background: #121212;
}

.about-page.is-dark .contact-form {
  background: #121212;
}

.about-page.is-dark .form-input,
.about-page.is-dark .form-textarea {
  background: #2a2a2a;
  border-color: #555;
  color: #e0e0e0;
}

.about-page.is-dark .form-input::placeholder,
.about-page.is-dark .form-textarea::placeholder {
  color: rgba(224, 224, 224, 0.4);
}

.about-page.is-dark .form-input:focus,
.about-page.is-dark .form-textarea:focus {
  border-color: #9ee8ff;
}

.about-page.is-dark .form-item:focus-within {
  background-color: #0d4a5e;
}

.about-page.is-dark .form-item:focus-within .form-input,
.about-page.is-dark .form-item:focus-within .form-textarea {
  border-color: #9ee8ff;
  background-color: #1a1a1a;
}

.about-page.is-dark .progress-bar {
  background-color: #333;
}

.about-page.is-dark .character-count {
  color: #999;
}

.about-page.is-dark .submit-button {
  background: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}

.about-page.is-dark .submit-button:hover {
  background: #9ee8ff;
}

.about-page.is-dark .contact-info {
  background: #0d4a5e;
}

.about-page.is-dark .contact-details h3,
.about-page.is-dark .contact-item h3 {
  color: #e0e0e0;
}

.about-page.is-dark .contact-details p {
  color: #ccc;
}

.about-page.is-dark .contact-details a,
.about-page.is-dark .contact-item a {
  color: #9ee8ff;
}

.about-page.is-dark .contact-icon {
  color: #e0e0e0;
}

.about-page.is-dark :deep(.member-name) {
  color: #e0e0e0;
}

.about-page.is-dark :deep(.action-button) {
  background-color: #2a2a2a;
  border-color: #555;
  color: #e0e0e0;
}

.about-page.is-dark :deep(.member-link:hover .action-button) {
  background-color: #e0e0e0;
  color: #1a1a1a;
  border-color: #e0e0e0;
}


.about-page.is-dark :deep(figure) {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.about-page.is-dark :deep(figure:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.about-page.is-dark :deep(figure span) {
  color: #e0e0e0 !important;
}

.about-page.is-dark :deep(figure p) {
  color: rgba(224, 224, 224, 0.4) !important;
}

.about-page.is-dark :deep(figure blockquote) {
  color: #ccc !important;
}

/* 移动端样式：768px及以下 */
@media (max-width: 768px) {
  .container {
    padding: 0 1.25rem;
  }
  
  .header-section {
    padding: 5rem 0 4.375rem 0;
    text-align: left;
  }
  /* 头部容器在移动端填满宽度，与 Research 页保持一致 */
  .header-section .container {
    max-width: 100%;
  }
  
  .main-title {
    font-size: 1.75rem;
    text-align: left;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  
  .main-description {
    font-size: 0.9375rem;
    text-align: left;
    line-height: 1.75rem;
  }
  
  .section {
    padding: 1.25rem 0 1.25rem 0;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 1.875rem;
    text-align: center;
  }
  
  .member-grid {
    gap: 1.25rem 0.75rem;
  }
  
  .contact-container {
    grid-template-columns: 1fr;
    gap: 1.375rem;
  }
  
  .contact-info {
    padding: 1.375rem 1.125rem;
  }
  
  .contact-details h3,
  .contact-item h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .contact-details p,
  .contact-details a,
  .contact-item a {
    font-size: 1rem;
  }
  
  .form-input,
  .form-textarea {
    font-size: 0.9375rem;
    padding: 0 1.125rem;
  }
  
  .form-input {
    height: 3.125rem;
  }
  
  .form-textarea {
    height: 4rem;
    padding: 0.875rem 1.125rem;
  }
  
  .form-input::placeholder,
  .form-textarea::placeholder {
    font-size: 0.9375rem;
  }
  
  .submit-button {
    height: 3.125rem;
    font-size: 0.9375rem;
  }
  
  .form-item:focus-within { border-radius: 0.75rem; padding: 0.5rem; transform: translateY(-0.25rem) translateX(-0.0625rem); box-shadow: 0.125rem 0.125rem 0 0 rgba(0, 0, 0, 1); }
  
  .alumni-grid {
    justify-content: center;
    gap: 0.9375rem;
  }
  
  .alumni-tag {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    height: auto;
    min-height: 3rem;
  }
  
  /* Marquee容器在平板上的优化 */
  .alumni-section .relative {
    height: 25rem;
  }

}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }
  
  .header-section {
    padding: 2.5rem 0 3.75rem 0;
  }
  .member-grid {
    grid-template-columns: repeat(1, 1fr);
    justify-content: stretch;
    max-width: 18rem;
    margin: 0 auto;
  }

  .main-title { font-size: 28px; margin-bottom: 12px; }
  .main-description { font-size: 14px; }
  
  .section {
    padding: 1.5625rem 0 0.9375rem 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
  
  .member-grid {
    gap: 1rem;
    max-width: 18.75rem;
  }
  
  .form-item {
    margin-bottom: 0.625rem;
  }
  
  .form-input,
  .form-textarea {
    font-size: 0.875rem;
    padding: 0 0.875rem;
    border-radius: 0.875rem;
    border-width: 0.0625rem;
  }
  
  .form-input {
    height: 2.75rem;
  }
  
  .form-textarea {
    height: 3rem;
    padding: 0.75rem 0.875rem;
  }
  
  .form-input::placeholder,
  .form-textarea::placeholder {
    font-size: 0.875rem;
  }
  
  .submit-button {
    height: 2.75rem;
    font-size: 0.875rem;
    border-radius: 0.875rem;
    border-width: 0.0625rem;
    margin-top: 0.625rem;
  }
  
  .contact-info {
    padding: 1.125rem 0.875rem;
    border-radius: 0.875rem;
  }
  
  .contact-item {
    margin-bottom: 1.5rem;
  }
  
  .contact-details h3,
  .contact-item h3 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }
  
  .contact-details p,
  .contact-details a,
  .contact-item a {
    font-size: 0.9375rem;
  }
  
  .progress-bar { height: 0.3125rem; }
  .character-count { font-size: 0.75rem; }
  
  .form-item:focus-within { border-radius: 0.625rem; padding: 0.375rem; transform: translateY(-0.1875rem) translateX(-0.0625rem); box-shadow: 0.125rem 0.125rem 0 0 rgba(0, 0, 0, 1); }
  
  .alumni-tag {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    border-radius: 0.625rem;
    min-height: 2.25rem;
  }
  
  /* 进度条在小屏幕上的优化 */
  .message-progress {
    margin-top: 0.375rem;
    gap: 0.5rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .character-count {
    font-size: 0.6875rem;
    text-align: center;
    min-width: auto;
  }
  
  /* Marquee容器在小屏幕上的优化 */
  .alumni-section .relative {
    height: 15.625rem;
    margin: 0 -0.75rem;
  }
  
  /* 横向滚动优化 */
  .alumni-grid {
    gap: 0.625rem;
  }
}


</style> 