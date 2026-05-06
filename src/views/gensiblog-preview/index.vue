<template>
  <!-- 未授权访问提示 -->
  <div v-if="accessDenied" class="access-denied">
    <div class="access-denied-card">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
      </svg>
      <h2>访问受限</h2>
      <p>该页面仅可通过后台管理列表的"预览"按钮进入</p>
      <button class="back-btn" @click="goToManage">返回管理页面</button>
    </div>
  </div>

  <div v-else class="blog-detail-page" :class="{ 'is-dark': isDark }">
    <!-- Header -->
    <!-- <Header /> -->

    <!-- Main Content -->
    <main class="main-content" v-if="blogPost">
      <!-- Sidebar Toggle Button (when collapsed) -->
      <button v-if="contentSections.length > 0 && sidebarCollapsed" class="sidebar-expand-btn" @click="toggleSidebar"
        :style="sidebarTopOffset > 0 ? { top: sidebarTopOffset + 'px' } : {}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Sidebar Navigation (Desktop - Fixed on left side) -->
      <aside class="sidebar-nav-fixed" :class="{ 'collapsed': sidebarCollapsed }" :style="sidebarStyle" v-if="contentSections.length > 0">
        <div class="sidebar-header">
          <span class="sidebar-title">Table of Contents</span>
          <button class="sidebar-collapse-btn" @click="toggleSidebar" title="Close Sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
        </div>
        <nav class="content-nav">
          <ul class="nav-list">
            <template v-for="(section, index) in contentSections" :key="index">
              <!-- Level 1 items (collapsible headers) -->
              <li v-if="section.level === 1" class="nav-item level-1"
                :class="{ 'has-children': hasChildren(index, 1) }">
                <div class="nav-link-wrapper">
                  <a @click.prevent="scrollToSection(section.id)" class="nav-link"
                    :class="{ 'active': activeSection === section.id }" :title="section.fullTitle || section.title">
                    {{ section.title }}
                  </a>
                  <button v-if="hasChildren(index, 1)" class="collapse-toggle" @click.stop="toggleSection(section.id)"
                    :class="{ 'collapsed': collapsedSections[section.id] }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </li>
              <!-- Level 2 items (can also be collapsible) -->
              <li v-else-if="section.level === 2" class="nav-item level-2"
                :class="{ 'hidden': isChildHidden(index), 'has-children': hasChildren(index, 2) }">
                <div class="nav-link-wrapper">
                  <a @click.prevent="scrollToSection(section.id)" class="nav-link"
                    :class="{ 'active': activeSection === section.id }" :title="section.fullTitle || section.title">
                    {{ section.title }}
                  </a>
                  <button v-if="hasChildren(index, 2)" class="collapse-toggle" @click.stop="toggleSection(section.id)"
                    :class="{ 'collapsed': collapsedSections[section.id] }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </li>
              <!-- Level 3 items (can also be collapsible) -->
              <li v-else-if="section.level === 3" class="nav-item level-3"
                :class="{ 'hidden': isChildHidden(index), 'has-children': hasChildren(index, 3) }">
                <div class="nav-link-wrapper">
                  <a @click.prevent="scrollToSection(section.id)" class="nav-link"
                    :class="{ 'active': activeSection === section.id }" :title="section.fullTitle || section.title">
                    {{ section.title }}
                  </a>
                  <button v-if="hasChildren(index, 3)" class="collapse-toggle" @click.stop="toggleSection(section.id)"
                    :class="{ 'collapsed': collapsedSections[section.id] }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div>
              </li>
              <!-- Level 4+ items (leaf items) -->
              <li v-else class="nav-item" :class="[`level-${section.level}`, { 'hidden': isChildHidden(index) }]">
                <a @click.prevent="scrollToSection(section.id)" class="nav-link"
                  :class="{ 'active': activeSection === section.id }" :title="section.fullTitle || section.title">
                  {{ section.title }}
                </a>
              </li>
            </template>
          </ul>
        </nav>
      </aside>

      <div class="container">
        <!-- Preview Banner -->
        <div class="preview-banner">
          <span class="preview-badge">预览模式</span>
          <span class="preview-text">此页面仅后台可见，用于测试展示效果</span>
          <button class="preview-back-btn" @click="goToManage">返回管理列表</button>
        </div>

        <!-- Title Section -->
        <section class="title-section" ref="titleSectionRef">
          <h1 class="blog-title">{{ blogPost.title }}</h1>
          <p class="blog-subtitle" v-if="blogPost.subtitle">
            {{ blogPost.subtitle }}
          </p>
        </section>

        <!-- Meta Information -->
        <section class="meta-section">
          <div class="meta-grid">
            <div class="meta-item" v-if="blogPost.author">
              <h3 class="meta-label">AUTHORS</h3>
              <p class="meta-value">{{ blogPost.author }}</p>
            </div>

            <div class="meta-item" v-if="blogPost.affiliations">
              <h3 class="meta-label">AFFILIATIONS</h3>
              <p class="meta-value">{{ blogPost.affiliations }}</p>
            </div>

            <div class="meta-item" v-if="blogPost.publish_time">
              <h3 class="meta-label">PUBLISHED</h3>
              <p class="meta-value">{{ formatDate(blogPost.publish_time) }}</p>
            </div>

            <div class="meta-item" v-if="blogPost.readtime">
              <h3 class="meta-label">READ TIME</h3>
              <p class="meta-value">{{ blogPost.readtime }} min</p>
            </div>
          </div>

          <!-- Team Info -->
          <div class="team-info" v-if="blogPost.team">
            <h3 class="info-label">Team:</h3>
            <p class="info-content">{{ blogPost.team }}</p>
          </div>

          <!-- Affiliations Description -->
          <div class="affiliations-info" v-if="blogPost.affiliations_des">
            <h3 class="info-label">Affiliations:</h3>
            <p class="info-content">{{ blogPost.affiliations_des }}</p>
          </div>
        </section>

        <!-- Links Section -->
        <section class="links-section"
          v-if="blogPost.page || blogPost.model || blogPost.paper_link || blogPost.github_link || blogPost.huggingface_link">
          <a v-if="blogPost.page" :href="blogPost.page" target="_blank" class="link-button page-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {{ blogPost.page_text || 'Page' }}
          </a>
          <a v-if="blogPost.paper_link" :href="blogPost.paper_link" target="_blank" class="link-button paper-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            {{ blogPost.paper_text || 'Paper' }}
          </a>
          <a v-if="blogPost.github_link" :href="blogPost.github_link" target="_blank" class="link-button github-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {{ blogPost.github_text || 'Code' }}
          </a>
          <a v-if="blogPost.model" :href="blogPost.model" target="_blank" class="link-button model-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
              </path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            {{ blogPost.model_text || 'Model' }}
          </a>
          <a v-if="blogPost.huggingface_link" :href="blogPost.huggingface_link" target="_blank"
            class="link-button hf-link">
            <img :src="hfIconUrl" alt="Hugging Face" class="hf-icon" />
            {{ blogPost.hug_text || 'HuggingFace' }}
          </a>
        </section>

        <!-- Introducing Section -->
        <section class="content-section" v-if="blogPost.introducing" id="introducing">
          <h2 class="section-title">{{ blogPost.introduction_label || 'Introduction' }}</h2>
          <div class="section-content" ref="introducingContent" v-html="blogPost.introducing"></div>
        </section>

        <!-- Main Content -->
        <section class="content-section" v-if="blogPost.content" id="main-content">
          <h2 class="section-title">{{ blogPost.content_label || 'Content' }}</h2>
          <div class="section-content" ref="mainContent" v-html="blogPost.content"></div>
        </section>

        <!-- Flex Content Sections -->
        <section
          v-for="(flexItem, fIdx) in flexSections"
          :key="`flex-${fIdx}`"
          class="content-section"
          :id="`flex-content-${fIdx}`"
        >
          <h2 class="section-title">{{ flexItem.labelname || `Section ${Number(fIdx) + 1}` }}</h2>
          <div
            class="section-content"
            :ref="(el: any) => { if (el) flexContentRefs[Number(fIdx)] = el; }"
            v-html="flexItem.content"
          ></div>
        </section>

        <!-- References Section -->
        <section class="content-section" v-if="blogPost.references" id="references">
          <h2 class="section-title">{{ blogPost.reference_label || 'Reference' }}</h2>
          <div class="section-content references-content" v-html="blogPost.references"></div>
        </section>

        <!-- Citation Section -->
        <section class="citation-section" v-if="blogPost.citation" id="citation">
          <h2 class="section-title">{{ blogPost.citation_label || 'Citation' }}</h2>
          <div class="citation-wrapper">
            <button class="copy-btn" @click="copyCitation" :class="{ 'copied': isCopied }">
              <svg v-if="!isCopied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
            <pre class="citation-code">{{ blogPost.citation }}</pre>
          </div>
        </section>

        <!-- Comments Section -->
        <section class="comments-section" id="comments">
          <h2 class="section-title">Comments</h2>

          <!-- Comment Form -->
          <div class="comment-form">
            <div class="form-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Leave a Comment</span>
            </div>
            <textarea
              v-model="newComment"
              class="comment-input"
              placeholder="Share your thoughts..."
              rows="4"
              maxlength="1000"
            ></textarea>
            <div class="form-footer">
              <span class="char-count">{{ newComment.length }}/1000</span>
              <button
                class="submit-btn"
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmitting"
              >
                <span v-if="isSubmitting" class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
                <span v-else>Submit</span>
              </button>
            </div>
          </div>

          <!-- Comments List -->
          <div class="comments-list" v-if="comments.length > 0">
            <div class="comments-header">
              <span class="comments-count">{{ comments.length }} Comments</span>
            </div>
            <div class="comment-item" v-for="(comment, index) in comments" :key="comment.id">
              <div class="comment-avatar">
                <img :src="getCommentAvatar(comment.id)" alt="avatar" class="avatar-img" />
              </div>
              <div class="comment-body">
                <div class="comment-meta">
                  <span class="comment-author">Reader #{{ index + 1 }}</span>
                  <span class="comment-time">{{ formatCommentDate(comment.created_at) }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="comments-empty" v-else>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        </section>
      </div>
    </main>

    <!-- Loading State -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading blog post...</p>
    </div>

    <!-- Footer -->
    <Footer />

    <!-- Back to Top -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';
import {
  useMessage
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import Header from '../portal/components/Header.vue';
import Footer from '../portal/components/Footer.vue';
import BackToTop from '../portal/components/BackToTop.vue';
import { fetchGensiblogById, fetchBlogCommentsByBlogId, submitBlogComment } from '@/service/api/gensiblog';
import { useThemeStore } from '@/store/modules/theme';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// HuggingFace 图标（通过 import 获取正确路径）
import hfIconUrl from '../portal/assests/home/huggingface.jpg';

defineOptions({
  name: 'GensiblogPreview'
});

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.darkMode);
const blogPost = ref<any>(null);
const contentSections = ref<any[]>([]);
const activeSection = ref<string>('');
const mainContent = ref<HTMLElement | null>(null);
const introducingContent = ref<HTMLElement | null>(null);
const flexContentRefs = ref<HTMLElement[]>([]);
const titleSectionRef = ref<HTMLElement | null>(null);
const sidebarTopOffset = ref(0);

// 路由来源检查
const accessDenied = ref(false);

function goToManage() {
  router.push({ name: 'gensiblog-manage' });
}

const flexSections = computed(() => {
  if (!blogPost.value?.flex_content) return [];
  if (Array.isArray(blogPost.value.flex_content)) {
    return blogPost.value.flex_content;
  }
  try {
    const arr = JSON.parse(blogPost.value.flex_content);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
});
const collapsedSections = ref<Record<string, boolean>>({});
const sidebarBottomOffset = ref(0);
const sidebarCollapsed = ref(false);

const isSafari = ref(false);
const safariSidebarMaxWidth = ref(0);
const PORTAL_ZOOM = 0.87;

function detectSafari() {
  if (typeof navigator !== 'undefined') {
    isSafari.value = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
}

function updateSafariSidebarWidth() {
  if (!isSafari.value) return;
  const vw = window.innerWidth;
  const scale = Math.min(1.5, Math.max(0.75, vw / remBaselineWidth));
  const currentRem = remBaseFontPx * scale;
  const containerVisualLeft = (vw - 63 * currentRem * PORTAL_ZOOM) / 2;
  safariSidebarMaxWidth.value = Math.max(200, Math.floor(containerVisualLeft - 12));
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const comments = ref<Api.BlogComment.BlogCommentItem[]>([]);
const newComment = ref('');
const isSubmitting = ref(false);

const isCopied = ref(false);
let copiedTimer: NodeJS.Timeout | null = null;

const copyCitation = async () => {
  if (!blogPost.value?.citation) return;
  try {
    await navigator.clipboard.writeText(blogPost.value.citation);
    isCopied.value = true;
    if (copiedTimer) clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    $message.error('Failed to copy to clipboard');
  }
};

const $message = useMessage();

const sidebarStyle = computed(() => {
  const style: Record<string, string> = {};
  if (sidebarTopOffset.value > 0) {
    style.top = `${sidebarTopOffset.value}px`;
  }
  if (sidebarBottomOffset.value > 0) {
    style.position = 'absolute';
    style.bottom = `${sidebarBottomOffset.value}px`;
    style.top = 'auto';
  }
  if (isSafari.value && safariSidebarMaxWidth.value > 0) {
    style.maxWidth = `${safariSidebarMaxWidth.value}px`;
  }
  return style;
});

const updateSidebarTopOffset = () => {
  if (titleSectionRef.value) {
    const rect = titleSectionRef.value.getBoundingClientRect();
    sidebarTopOffset.value = rect.top + window.scrollY;
  }
};

const initCollapsedSections = (sections: any[]) => {
  const collapsed: Record<string, boolean> = {};
  sections.forEach((section, index) => {
    const nextIndex = index + 1;
    if (nextIndex < sections.length && sections[nextIndex].level > section.level) {
      collapsed[section.id] = false;
    }
  });
  collapsedSections.value = collapsed;
};

const hasChildren = (index: number, currentLevel: number): boolean => {
  const nextIndex = index + 1;
  if (nextIndex >= contentSections.value.length) return false;
  return contentSections.value[nextIndex].level > currentLevel;
};

const getParentSectionIds = (index: number): string[] => {
  const currentLevel = contentSections.value[index].level;
  const parentIds: string[] = [];
  for (let targetLevel = currentLevel - 1; targetLevel >= 1; targetLevel--) {
    for (let i = index - 1; i >= 0; i--) {
      if (contentSections.value[i].level === targetLevel) {
        parentIds.push(contentSections.value[i].id);
        break;
      }
      if (contentSections.value[i].level < targetLevel) {
        break;
      }
    }
  }
  return parentIds;
};

const isChildHidden = (index: number): boolean => {
  const parentIds = getParentSectionIds(index);
  return parentIds.some(parentId => collapsedSections.value[parentId] === true);
};

const toggleSection = (sectionId: string) => {
  collapsedSections.value[sectionId] = !collapsedSections.value[sectionId];
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const extractSections = (htmlContent: string, startIndex: number = 0) => {
  if (!htmlContent) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5');
  return Array.from(headings).map((heading, index) => {
    const id = `section-${startIndex + index}`;
    const fullTitle = heading.textContent || '';
    const colonIndex = fullTitle.indexOf(':');
    const title = colonIndex > 0 ? fullTitle.substring(0, colonIndex).trim() : fullTitle;
    return { id, title, fullTitle, level: parseInt(heading.tagName.charAt(1)) };
  });
};

const buildNavigation = () => {
  const sections: any[] = [];
  if (blogPost.value?.introducing) {
    sections.push({ id: 'introducing', title: blogPost.value.introduction_label || 'Introduction', level: 1 });
    const introducingSections = extractSections(blogPost.value.introducing, sections.length);
    sections.push(...introducingSections);
  }
  if (blogPost.value?.content) {
    sections.push({ id: 'main-content', title: blogPost.value.content_label || 'Content', level: 1 });
    const contentSectionsFromHTML = extractSections(blogPost.value.content, sections.length);
    sections.push(...contentSectionsFromHTML);
  }
  if (flexSections.value && flexSections.value.length > 0) {
    flexSections.value.forEach((item: any, fIdx: number) => {
      sections.push({ id: `flex-content-${fIdx}`, title: item.labelname || `Section ${fIdx + 1}`, level: 1 });
      if (item.content) {
        const flexHeadings = extractSections(item.content, sections.length);
        sections.push(...flexHeadings);
      }
    });
  }
  if (blogPost.value?.references) {
    sections.push({ id: 'references', title: blogPost.value.reference_label || 'Reference', level: 1 });
  }
  if (blogPost.value?.citation) {
    sections.push({ id: 'citation', title: blogPost.value.citation_label || 'Citation', level: 1 });
  }
  sections.push({ id: 'comments', title: 'Comments', level: 1 });
  return sections;
};

function processKatexInHtml(html: string): string {
  if (!html) return html;
  const cleanFormula = (raw: string): string => {
    return raw
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    try {
      const clean = cleanFormula(formula);
      if (!clean) return _match;
      return katex.renderToString(clean, { displayMode: true, throwOnError: false });
    } catch { return _match; }
  });
  html = html.replace(/(?<!\$)\$(?!\$)((?:[^\$<]|<[^>]*>)+?)\$(?!\$)/g, (_match, formula) => {
    try {
      const clean = cleanFormula(formula);
      if (!clean) return _match;
      return katex.renderToString(clean, { displayMode: false, throwOnError: false });
    } catch { return _match; }
  });
  return html;
}

const addIdsToHeadings = () => {
  setTimeout(() => {
    let globalIndex = blogPost.value?.introducing ? 1 : 0;
    if (introducingContent.value) {
      const headings = introducingContent.value.querySelectorAll('h1, h2, h3, h4, h5');
      headings.forEach((heading) => {
        heading.setAttribute('id', `section-${globalIndex}`);
        globalIndex++;
      });
    }
    if (blogPost.value?.content) {
      globalIndex++;
    }
    if (mainContent.value) {
      const headings = mainContent.value.querySelectorAll('h1, h2, h3, h4, h5');
      headings.forEach((heading) => {
        heading.setAttribute('id', `section-${globalIndex}`);
        globalIndex++;
      });
    }
    if (flexContentRefs.value && flexContentRefs.value.length > 0) {
      flexContentRefs.value.forEach((flexEl) => {
        if (!flexEl) return;
        globalIndex++;
        const headings = flexEl.querySelectorAll('h1, h2, h3, h4, h5');
        headings.forEach((heading) => {
          heading.setAttribute('id', `section-${globalIndex}`);
          globalIndex++;
        });
      });
    }
  }, 100);
};

const scrollToSection = (sectionId: string) => {
  let element = document.getElementById(sectionId);
  const performScroll = () => {
    element = document.getElementById(sectionId);
    if (!element) {
      addIdsToHeadings();
      setTimeout(() => {
        element = document.getElementById(sectionId);
        if (element) doScroll(element);
      }, 200);
      return;
    }
    doScroll(element);
  };
  const doScroll = (el: HTMLElement) => {
    const offset = 120;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({ top: offsetPosition + 100, behavior: 'smooth' });
    activeSection.value = sectionId;
  };
  performScroll();
};

const handleScroll = () => {
  const sections = contentSections.value.map(s => s.id);
  const scrollPosition = window.scrollY + 150;
  let newActiveSection = '';
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i]);
    if (section) {
      const rect = section.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      if (absoluteTop <= scrollPosition) {
        newActiveSection = sections[i];
        break;
      }
    }
  }
  if (newActiveSection && newActiveSection !== activeSection.value) {
    activeSection.value = newActiveSection;
  }
  const footer = document.querySelector('.footer') as HTMLElement;
  if (footer) {
    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (footerRect.top < windowHeight) {
      const overlap = windowHeight - footerRect.top + 20;
      if (overlap > 0) sidebarBottomOffset.value = overlap;
    } else {
      sidebarBottomOffset.value = 0;
    }
  }
};

const loadBlogPost = async () => {
  const id = route.query.id as string;
  if (!id) return;
  try {
    const data = await fetchGensiblogById(id);
    if (data && data.length > 0) {
      const post = data[0];
      if (post.introducing) post.introducing = processKatexInHtml(post.introducing);
      if (post.content) post.content = processKatexInHtml(post.content);
      if (post.references) post.references = processKatexInHtml(post.references);
      if ((post as any).flex_content) {
        try {
          const flexArr = JSON.parse((post as any).flex_content);
          if (Array.isArray(flexArr)) {
            flexArr.forEach((item: any) => {
              if (item.content) item.content = processKatexInHtml(item.content);
            });
            (post as any).flex_content = flexArr;
          }
        } catch { /* ignore */ }
      }
      blogPost.value = post;
      contentSections.value = buildNavigation();
      initCollapsedSections(contentSections.value);
      await nextTick();
      addIdsToHeadings();
      setTimeout(() => { updateSidebarTopOffset(); }, 100);
      await loadComments();
    }
  } catch (error) {
    console.error('Error loading blog post:', error);
  }
};

const loadComments = async () => {
  const id = route.query.id as string;
  if (!id) return;
  try {
    const data = await fetchBlogCommentsByBlogId(id);
    comments.value = data || [];
  } catch (error) {
    console.error('Error loading comments:', error);
    comments.value = [];
  }
};

const submitComment = async () => {
  const id = route.query.id as string;
  if (!id || !newComment.value.trim()) return;
  isSubmitting.value = true;
  try {
    await submitBlogComment({ content: newComment.value.trim(), blog_id: id });
    newComment.value = '';
    $message.success('Comment submitted successfully! It will be visible after review.');
    await loadComments();
  } catch (error) {
    $message.error('Failed to submit comment. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const avatarImages: Record<string, string> = {};
const getCommentAvatar = (commentId: string | number): string => {
  const key = String(commentId);
  if (!avatarImages[key]) {
    const num = Math.floor(Math.random() * 5) + 1;
    avatarImages[key] = new URL(`../../assets/imgs/${num}.jpeg`, import.meta.url).href;
  }
  return avatarImages[key];
};

const formatCommentDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const remBaselineWidth = 1700;
const remBaseFontPx = 16;
let originalRootFontSize = '' as string;

function updateRootRem() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const width = window.innerWidth || remBaselineWidth;
  const scale = width / remBaselineWidth;
  const clampedScale = Math.min(1.5, Math.max(0.75, scale));
  const nextFont = remBaseFontPx * clampedScale;
  document.documentElement.style.fontSize = `${nextFont}px`;
}

let resizeTimeout: NodeJS.Timeout | null = null;
function debouncedHandleResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateRootRem();
    updateSidebarTopOffset();
    updateSafariSidebarWidth();
  }, 200);
}

onMounted(async () => {
  detectSafari();
  updateSafariSidebarWidth();
  if (typeof document !== 'undefined') {
    originalRootFontSize = document.documentElement.style.fontSize;
    updateRootRem();
  }
  window.addEventListener('resize', debouncedHandleResize);
  window.addEventListener('scroll', handleScroll);
  await loadBlogPost();
});

onUnmounted(() => {
  window.removeEventListener('resize', debouncedHandleResize);
  window.removeEventListener('scroll', handleScroll);
  if (resizeTimeout) { clearTimeout(resizeTimeout); resizeTimeout = null; }
  if (typeof document !== 'undefined') {
    document.documentElement.style.fontSize = originalRootFontSize;
  }
});
</script>

<style scoped>
@import '../portal/assests/common.css';

/* 访问受限页面 */
.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
}

.access-denied-card {
  text-align: center;
  padding: 3rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-width: 480px;
}

.access-denied-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 1.5rem 0 0.75rem;
}

.access-denied-card p {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 预览横幅 */
.preview-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #f59e0b;
  color: #fff;
  border-radius: 1rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.preview-text {
  font-family: 'Noto Sans', sans-serif;
  font-size: 0.875rem;
  color: #92400e;
  flex: 1;
}

.preview-back-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 1rem;
  background: #fff;
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.preview-back-btn:hover {
  background: #f59e0b;
  color: #fff;
}

/* === 以下样式完全复制自 blogdetail === */

.blog-detail-page {
  min-height: 100vh;
}

.container {
  max-width: 63rem;
  margin: 0 auto;
  padding: 0 3rem;
}

.header {
  background: transparent;
}

.main-content {
  padding: 3.75rem 0 5rem 0;
  background: transparent;
  position: relative;
}

.sidebar-nav-fixed {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 30rem;
  overflow-y: auto;
  z-index: 200;
  background: transparent;
  padding-top: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-nav-fixed.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem 0.5rem 2rem;
  z-index: 10;
}

.sidebar-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.02em;
}

.sidebar-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.sidebar-collapse-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #333;
}

.sidebar-expand-btn {
  position: fixed;
  left: 0.75rem;
  top: 10rem;
  z-index: 199;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  color: #555;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.sidebar-expand-btn:hover {
  background: #f5f5f5;
  color: #000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.sidebar-nav-fixed .content-nav {
  padding: 0.75rem 1.25rem;
}

@media (min-width: 1440px) {
  .sidebar-nav-fixed { width: 30rem; }
}

@media (max-width: 1100px) {
  .sidebar-nav-fixed { display: none; }
  .sidebar-expand-btn { display: none; }
}

.title-section {
  padding-bottom: 1.5rem;
  border-bottom: none;
}

.blog-title {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  color: #000000;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.blog-subtitle {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.125rem;
  color: #444444;
  line-height: 1.7;
  margin: 0;
}

.meta-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #D3D3D3;
}

.meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin-bottom: 1.5rem;
}

.meta-item { flex: 0 0 auto; }

.meta-label {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: #666666;
  margin: 0 0 0.375rem 0;
}

.meta-value {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.1875rem;
  color: #000000;
  margin: 0;
  line-height: 1.6;
}

.team-info,
.affiliations-info { margin-bottom: 1rem; }

.info-label {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.0625rem;
  font-weight: 400;
  color: #666666;
  margin: 0 0 0.25rem 0;
  display: inline;
}

.info-content {
  font-family: 'Noto Sans', sans-serif;
  font-size: 1.1875rem;
  color: #000000;
  line-height: 1.7;
  margin: 0;
  display: inline;
}

.links-section {
  display: flex;
  gap: 0.875rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-family: 'Noto Sans', sans-serif;
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.github-link { background: #24292e; color: #ffffff; border-color: #24292e; }
.github-link:hover { background: #000000; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }

.hf-link { background: #FFD21E; color: #000000; border-color: #FFD21E; }
.hf-link:hover { background: #FFC107; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2); }

.hf-icon { width: 20px; height: 20px; object-fit: contain; }

.page-link { background: #4A90D9; color: #ffffff; border-color: #4A90D9; }
.page-link:hover { background: #357ABD; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(74, 144, 217, 0.3); }

.model-link { background: #7C3AED; color: #ffffff; border-color: #7C3AED; }
.model-link:hover { background: #6D28D9; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3); }

.paper-btn { background: #059669; color: #ffffff; border-color: #059669; }
.paper-btn:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); }

.content-nav { background: transparent; padding: 0 1.75rem 0 1.25rem; }

.nav-list { list-style: none; padding: 0; margin: 0; }

.nav-item { margin-bottom: 0.25rem; transition: all 0.3s ease; }

.nav-item.hidden { max-height: 0; margin: 0; opacity: 0; overflow: hidden; pointer-events: none; }

.nav-item.level-1 { margin-bottom: 0.25rem; }

.nav-link-wrapper { display: flex; align-items: center; justify-content: space-between; gap: 0.25rem; }
.nav-link-wrapper .nav-link { flex: 1; }
.nav-item.level-1 .nav-link { font-weight: 600; color: #000000; }

.collapse-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem; background: transparent; border: none;
  border-radius: 0.25rem; cursor: pointer; color: #888; transition: all 0.2s ease;
  flex-shrink: 0; margin-left: 0.25rem;
}
.collapse-toggle:hover { background: rgba(0, 0, 0, 0.06); color: #333; }
.collapse-toggle:active { transform: scale(0.92); }
.collapse-toggle svg { transition: transform 0.25s ease; }
.collapse-toggle.collapsed svg { transform: rotate(-90deg); }
.collapse-toggle.collapsed { color: #555; }
.collapse-toggle.collapsed:hover { color: #000; }

.nav-item.level-2 .nav-link-wrapper,
.nav-item.level-2>.nav-link { padding-left: 1rem; }
.nav-item.level-2 .nav-link { padding-left: 0.25rem; }

.nav-item.level-3 .nav-link-wrapper,
.nav-item.level-3>.nav-link { padding-left: 2rem; }
.nav-item.level-3 .nav-link { padding-left: 0.25rem; }

.nav-item.level-4 .nav-link { padding-left: 3.25rem; }
.nav-item.level-5 .nav-link { padding-left: 4.25rem; }

.nav-link {
  font-family: 'Noto Sans', sans-serif; font-size: 1.1875rem; color: #333333;
  text-decoration: none; transition: all 0.2s ease; cursor: pointer;
  display: block; padding: 0.2rem 0.75rem; border-radius: 0.375rem;
  line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  position: relative;
}
.nav-link:hover { color: #000000; background: rgba(0, 0, 0, 0.04); }
.nav-link.active { color: #000000; font-weight: 600; background: rgba(0, 0, 0, 0.08); }
.nav-link.active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 60%; background: #000000; border-radius: 0 2px 2px 0;
}

.sidebar-nav-fixed::-webkit-scrollbar { width: 5px; }
.sidebar-nav-fixed::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav-fixed::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
.sidebar-nav-fixed::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

.content-section { margin-bottom: 0.5rem; }

.section-title {
  font-family: 'Sora', sans-serif; font-size: 1.825rem; font-weight: 700;
  color: #000000; margin: 0 0 0.25rem 0; padding-bottom: 0;
  border-bottom: none; letter-spacing: -0.01em;
}

.section-content {
  font-family: 'Noto Sans', sans-serif; font-size: 1.1875rem;
  color: #2C2C2C; line-height: 1.6; overflow-x: auto;
}

.section-content :deep(h1), .section-content :deep(h2), .section-content :deep(h3),
.section-content :deep(h4), .section-content :deep(h5) {
  font-family: 'Sora', sans-serif; font-weight: 700; color: #000000;
  margin: 1.75rem 0 1.25rem 0; letter-spacing: -0.01em;
}
.section-content :deep(h1) { font-size: 1.875rem; }
.section-content :deep(h2) { font-size: 1.625rem; }
.section-content :deep(h3) { font-size: 1.5rem; }
.section-content :deep(h4) { font-size: 1.3125rem; font-weight: 600; }
.section-content :deep(h5) { font-size: 1.1875rem; font-weight: 600; }

.section-content :deep(p) { margin: 1.25rem 0; text-align: justify; }

.section-content :deep(ul), .section-content :deep(ol) { margin: 1.5rem 0; padding-left: 2.5rem; }
.section-content :deep(ol) { list-style-type: decimal !important; list-style-position: outside; }
.section-content :deep(ul) { list-style-type: disc !important; list-style-position: outside; }
.section-content :deep(ol ol) { list-style-type: lower-alpha !important; }
.section-content :deep(ol ol ol) { list-style-type: lower-roman !important; }
.section-content :deep(ul ul) { list-style-type: circle !important; }
.section-content :deep(ul ul ul) { list-style-type: square !important; }
.section-content :deep(li) { margin: 0.4rem 0; line-height: 1.6; display: list-item !important; }

.section-content :deep(a) { color: #0066cc; text-decoration: none; border-bottom: 1px solid transparent; transition: border-bottom 0.2s ease; }
.section-content :deep(a:hover) { border-bottom: 1px solid #0066cc; }

.section-content :deep(code) { background: #f5f5f5; padding: 0.125rem 0.375rem; border-radius: 0.1875rem; font-family: 'Courier New', monospace; font-size: 0.9em; color: #333333; }
.section-content :deep(pre) { background: #f5f5f5; padding: 1.25rem; border-radius: 0.375rem; overflow-x: auto; margin: 1.5rem 0; border: 1px solid #e0e0e0; }

.section-content :deep(.katex-display) { margin: 1.5rem 0; overflow-x: auto; overflow-y: hidden; padding: 0.5rem 0; }
.section-content :deep(.katex) { font-size: 1.1em; }

.section-content :deep(img) { max-width: 100%; height: auto; border-radius: 0.25rem; margin: 2rem 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }

.section-content :deep(table) {
  width: 100%; min-width: 500px; border-spacing: 0; border-collapse: separate;
  margin: 1.75rem 0; font-size: 0.95em; border: 1px solid #d0d0d0; border-radius: 6px; overflow: hidden;
}
.section-content :deep(thead) { background: #f0f0f0; }
.section-content :deep(th), .section-content :deep(td) { border-bottom: 1px solid #d0d0d0; border-right: 1px solid #d0d0d0; padding: 0.625rem 1rem; text-align: left; }
.section-content :deep(th:last-child), .section-content :deep(td:last-child) { border-right: none; }
.section-content :deep(tbody tr:last-child td) { border-bottom: none; }
.section-content :deep(th) { font-weight: 700; color: #1a1a1a; background: #f0f0f0; font-family: 'Sora', sans-serif; font-size: 0.9em; letter-spacing: 0.02em; white-space: nowrap; }
.section-content :deep(tbody tr) { transition: background-color 0.15s ease; }
.section-content :deep(tbody tr:nth-child(even)) { background-color: #fafafa; }
.section-content :deep(tbody tr:hover) { background-color: #f5f5f5; }
.section-content :deep(td) { color: #2C2C2C; }

.section-content :deep(div[data-w-e-type="mergedTable"]) { width: 100%; overflow-x: auto; margin: 1.75rem 0; }
.section-content :deep(div[data-w-e-type="mergedTable"]) table { width: 100%; border-spacing: 0; border-collapse: collapse; margin: 0; font-size: 0.95em; border: 1px solid #d0d0d0; border-radius: 0; overflow: visible; }
.section-content :deep(div[data-w-e-type="mergedTable"]) th,
.section-content :deep(div[data-w-e-type="mergedTable"]) td { border: 1px solid #d0d0d0; padding: 0.625rem 1rem; text-align: left; }

.section-content :deep(table:has([colspan])),
.section-content :deep(table:has([rowspan])) { border-collapse: collapse; border-radius: 0; overflow: visible; }
.section-content :deep(table:has([colspan])) th, .section-content :deep(table:has([colspan])) td,
.section-content :deep(table:has([rowspan])) th, .section-content :deep(table:has([rowspan])) td { border: 1px solid #d0d0d0; }

.references-content { margin-top: 1.5rem; }
.references-content :deep(p) { line-height: 1.7; }

.citation-section { margin-bottom: 3rem; }
.citation-wrapper { position: relative; }
.copy-btn {
  position: absolute; top: 0.625rem; right: 0.625rem;
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.75rem; background: #ffffff; border: 1px solid #d0d0d0;
  border-radius: 0.375rem; font-family: 'Noto Sans', sans-serif;
  font-size: 0.8125rem; font-weight: 500; color: #555; cursor: pointer;
  transition: all 0.2s ease; z-index: 1;
}
.copy-btn:hover { background: #f0f0f0; border-color: #bbb; color: #333; }
.copy-btn:active { transform: scale(0.96); }
.copy-btn.copied { background: #059669; border-color: #059669; color: #ffffff; }

.citation-code {
  background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 0.1875rem;
  padding: 1.25rem; padding-top: 2.75rem; font-family: 'Courier New', monospace;
  font-size: 0.875rem; color: #2C2C2C; line-height: 1.7; overflow-x: auto;
  white-space: pre-wrap; word-wrap: break-word; margin: 0;
}

.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 1rem; }
.loading-spinner { width: 3rem; height: 3rem; border: 0.25rem solid #f3f3f3; border-top: 0.25rem solid #000000; border-radius: 50%; animation: spin 1s linear infinite; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 1024px) { .container { max-width: 90%; padding: 0 32px; } }

@media (max-width: 768px) {
  .container { max-width: 95%; padding: 0 16px; }
  .main-content { padding: 40px 0; }
  .blog-title { font-size: 28px; }
  .blog-subtitle { font-size: 16px; }
  .meta-grid { flex-direction: column; gap: 20px; }
  .meta-item { font-size: 14px; }
  .section-title { font-size: 24px; }
  .section-content { font-size: 16px; }
  .section-content :deep(h1) { font-size: 22px; }
  .section-content :deep(h2) { font-size: 20px; }
  .section-content :deep(h3) { font-size: 19px; }
  .section-content :deep(h4) { font-size: 17.5px; }
  .section-content :deep(h5) { font-size: 16.5px; }
  .section-content :deep(th), .section-content :deep(td) { padding: 0.5rem 0.75rem; font-size: 0.85em; }
  .preview-banner { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}

@media (max-width: 480px) {
  .container { max-width: 98%; padding: 0 12px; }
  .main-content { padding: 30px 0; }
  .blog-title { font-size: 24px; }
  .blog-subtitle { font-size: 14px; }
  .meta-grid { gap: 16px; }
  .meta-item { font-size: 12px; }
  .section-title { font-size: 20px; }
  .section-content { font-size: 14px; }
  .section-content :deep(h1) { font-size: 18px; }
  .section-content :deep(h2) { font-size: 16px; }
  .section-content :deep(h3) { font-size: 15.5px; }
  .section-content :deep(h4) { font-size: 15px; }
  .section-content :deep(h5) { font-size: 14px; }
  .section-content :deep(th), .section-content :deep(td) { padding: 0.375rem 0.5rem; font-size: 0.8em; }
}

/* Comments Section */
.comments-section { margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid #e5e5e5; }

.comment-form {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e8e8e8; border-radius: 1rem; padding: 1.5rem;
  margin: 1.5rem 0 2.5rem 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.form-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 1.125rem; color: #1a1a1a; }
.form-header svg { color: #666; }

.comment-input {
  width: 100%; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 0.5rem;
  font-family: 'Noto Sans', sans-serif; font-size: 1rem; line-height: 1.6;
  resize: vertical; transition: all 0.2s ease; background: #ffffff; color: #333;
}
.comment-input:focus { outline: none; border-color: #333; box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05); }
.comment-input::placeholder { color: #999; }

.form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
.char-count { font-family: 'Noto Sans', sans-serif; font-size: 0.875rem; color: #888; }

.submit-btn {
  display: inline-flex; align-items: center; justify-content: center; min-width: 100px;
  padding: 0.75rem 1.5rem; background: #1a1a1a; color: #ffffff; border: none;
  border-radius: 0.5rem; font-family: 'Sora', sans-serif; font-weight: 600;
  font-size: 0.9375rem; cursor: pointer; transition: all 0.2s ease;
}
.submit-btn:hover:not(:disabled) { background: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

.loading-dots { display: flex; gap: 4px; }
.loading-dots span { width: 6px; height: 6px; background: #fff; border-radius: 50%; animation: loadingDot 1.4s infinite ease-in-out both; }
.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes loadingDot { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

.comments-list { margin-top: 2rem; }
.comments-header { margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #eee; }
.comments-count { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 1rem; color: #666; }

.comment-item { display: flex; gap: 1rem; padding: 1.25rem 0; border-bottom: 1px solid #f0f0f0; transition: background 0.2s ease; }
.comment-item:last-child { border-bottom: none; }
.comment-item:hover { background: rgba(0, 0, 0, 0.01); margin: 0 -1rem; padding-left: 1rem; padding-right: 1rem; border-radius: 0.5rem; }

.comment-avatar { flex-shrink: 0; width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }

.comment-body { flex: 1; min-width: 0; }
.comment-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.comment-author { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 0.9375rem; color: #1a1a1a; }
.comment-time { font-family: 'Noto Sans', sans-serif; font-size: 0.8125rem; color: #888; }
.comment-content { font-family: 'Noto Sans', sans-serif; font-size: 1rem; line-height: 1.7; color: #444; margin: 0; word-wrap: break-word; }

.comments-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; color: #999; }
.comments-empty svg { margin-bottom: 1rem; opacity: 0.5; }
.comments-empty p { font-family: 'Noto Sans', sans-serif; font-size: 1rem; margin: 0; }

@media (max-width: 768px) {
  .comments-section { margin-top: 2.5rem; padding-top: 2rem; }
  .comment-form { padding: 1.25rem; }
  .form-header { font-size: 1rem; }
  .comment-input { font-size: 0.9375rem; }
  .submit-btn { min-width: 80px; padding: 0.625rem 1.25rem; font-size: 0.875rem; }
  .comment-avatar { width: 2rem; height: 2rem; }
  .comment-avatar .avatar-img { width: 100%; height: 100%; }
  .comment-author { font-size: 0.875rem; }
  .comment-time { font-size: 0.75rem; }
  .comment-content { font-size: 0.9375rem; }
}

@media (max-width: 480px) {
  .comment-form { padding: 1rem; border-radius: 0.75rem; }
  .form-footer { flex-direction: column; gap: 0.75rem; align-items: stretch; }
  .char-count { text-align: right; }
  .submit-btn { width: 100%; }
  .comment-meta { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
}

/* ========== Dark Mode ========== */
.blog-detail-page.is-dark { background: #121212; }
.blog-detail-page.is-dark .main-content { background: transparent; }

.blog-detail-page.is-dark .sidebar-nav-fixed { background: transparent; }
.blog-detail-page.is-dark .sidebar-title { color: #e0e0e0; }
.blog-detail-page.is-dark .sidebar-collapse-btn { color: #999; }
.blog-detail-page.is-dark .sidebar-collapse-btn:hover { background: rgba(255, 255, 255, 0.08); color: #e0e0e0; }
.blog-detail-page.is-dark .sidebar-expand-btn { background: #2a2a2a; border-color: #444; color: #ccc; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
.blog-detail-page.is-dark .sidebar-expand-btn:hover { background: #333; color: #fff; }
.blog-detail-page.is-dark .nav-link { color: #bbb; }
.blog-detail-page.is-dark .nav-item.level-1 .nav-link { color: #e0e0e0; }
.blog-detail-page.is-dark .nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.06); }
.blog-detail-page.is-dark .nav-link.active { color: #fff; font-weight: 600; background: rgba(255, 255, 255, 0.1); }
.blog-detail-page.is-dark .nav-link.active::before { background: #9ee8ff; }
.blog-detail-page.is-dark .collapse-toggle { color: #777; }
.blog-detail-page.is-dark .collapse-toggle:hover { background: rgba(255, 255, 255, 0.08); color: #ccc; }
.blog-detail-page.is-dark .collapse-toggle.collapsed { color: #888; }
.blog-detail-page.is-dark .collapse-toggle.collapsed:hover { color: #e0e0e0; }
.blog-detail-page.is-dark .sidebar-nav-fixed::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
.blog-detail-page.is-dark .sidebar-nav-fixed::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }

.blog-detail-page.is-dark .blog-title { color: #e0e0e0; }
.blog-detail-page.is-dark .blog-subtitle { color: #bbb; }
.blog-detail-page.is-dark .meta-section { border-bottom-color: #444; }
.blog-detail-page.is-dark .meta-label { color: #999; }
.blog-detail-page.is-dark .meta-value { color: #e0e0e0; }
.blog-detail-page.is-dark .info-label { color: #999; }
.blog-detail-page.is-dark .info-content { color: #e0e0e0; }
.blog-detail-page.is-dark .tag-badge { background: #2a2a2a; color: #ccc; border-color: #444; }
.blog-detail-page.is-dark .tag-badge:hover { background: #333; border-color: #555; }

.blog-detail-page.is-dark .section-title { color: #e0e0e0; }
.blog-detail-page.is-dark .section-content { color: #ccc; }
.blog-detail-page.is-dark .section-content :deep(h1),
.blog-detail-page.is-dark .section-content :deep(h2),
.blog-detail-page.is-dark .section-content :deep(h3),
.blog-detail-page.is-dark .section-content :deep(h4),
.blog-detail-page.is-dark .section-content :deep(h5) { color: #e0e0e0; }
.blog-detail-page.is-dark .section-content :deep(p) { color: #ccc; }
.blog-detail-page.is-dark .section-content :deep(li) { color: #ccc; }
.blog-detail-page.is-dark .section-content :deep(a) { color: #6cb8ff; }
.blog-detail-page.is-dark .section-content :deep(a:hover) { border-bottom-color: #6cb8ff; }
.blog-detail-page.is-dark .section-content :deep(strong) { color: #e0e0e0; }
.blog-detail-page.is-dark .section-content :deep(code) { background: #2a2a2a; color: #e0e0e0; }
.blog-detail-page.is-dark .section-content :deep(pre) { background: #1e1e1e; border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(img) { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4); }

.blog-detail-page.is-dark .section-content :deep(table) { border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(thead) { background: #2a2a2a; }
.blog-detail-page.is-dark .section-content :deep(th) { color: #e0e0e0; background: #2a2a2a; border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(td) { color: #ccc; border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(th),
.blog-detail-page.is-dark .section-content :deep(td) { border-bottom-color: #444; border-right-color: #444; }
.blog-detail-page.is-dark .section-content :deep(tbody tr:nth-child(even)) { background-color: #1e1e1e; }
.blog-detail-page.is-dark .section-content :deep(tbody tr:hover) { background-color: #2a2a2a; }

.blog-detail-page.is-dark .section-content :deep(div[data-w-e-type="mergedTable"]) table { border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(div[data-w-e-type="mergedTable"]) th,
.blog-detail-page.is-dark .section-content :deep(div[data-w-e-type="mergedTable"]) td { border-color: #444; }
.blog-detail-page.is-dark .section-content :deep(table:has([colspan])) th,
.blog-detail-page.is-dark .section-content :deep(table:has([colspan])) td,
.blog-detail-page.is-dark .section-content :deep(table:has([rowspan])) th,
.blog-detail-page.is-dark .section-content :deep(table:has([rowspan])) td { border-color: #444; }

.blog-detail-page.is-dark .references-content :deep(p) { color: #bbb; }

.blog-detail-page.is-dark .citation-code { background: #1e1e1e; border-color: #444; color: #ccc; }
.blog-detail-page.is-dark .copy-btn { background: #2a2a2a; border-color: #555; color: #ccc; }
.blog-detail-page.is-dark .copy-btn:hover { background: #333; border-color: #666; color: #e0e0e0; }
.blog-detail-page.is-dark .copy-btn.copied { background: #059669; border-color: #059669; color: #fff; }

.blog-detail-page.is-dark .comments-section { border-top-color: #444; }
.blog-detail-page.is-dark .comment-form { background: linear-gradient(135deg, #1e1e1e 0%, #242424 100%); border-color: #444; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2); }
.blog-detail-page.is-dark .form-header { color: #e0e0e0; }
.blog-detail-page.is-dark .form-header svg { color: #999; }
.blog-detail-page.is-dark .comment-input { background: #1a1a1a; border-color: #444; color: #e0e0e0; }
.blog-detail-page.is-dark .comment-input:focus { border-color: #9ee8ff; box-shadow: 0 0 0 3px rgba(158, 232, 255, 0.1); }
.blog-detail-page.is-dark .comment-input::placeholder { color: #666; }
.blog-detail-page.is-dark .char-count { color: #666; }
.blog-detail-page.is-dark .submit-btn { background: #e0e0e0; color: #1a1a1a; }
.blog-detail-page.is-dark .submit-btn:hover:not(:disabled) { background: #9ee8ff; color: #1a1a1a; }
.blog-detail-page.is-dark .submit-btn:disabled { background: #444; color: #777; }
.blog-detail-page.is-dark .comments-header { border-bottom-color: #333; }
.blog-detail-page.is-dark .comments-count { color: #999; }
.blog-detail-page.is-dark .comment-item { border-bottom-color: #2a2a2a; }
.blog-detail-page.is-dark .comment-item:hover { background: rgba(255, 255, 255, 0.02); }
.blog-detail-page.is-dark .comment-author { color: #e0e0e0; }
.blog-detail-page.is-dark .comment-time { color: #666; }
.blog-detail-page.is-dark .comment-content { color: #bbb; }
.blog-detail-page.is-dark .comments-empty { color: #666; }
.blog-detail-page.is-dark .comments-empty svg { color: #555; }

.blog-detail-page.is-dark .loading-container { color: #999; }
.blog-detail-page.is-dark .loading-spinner { border-color: #333; border-top-color: #e0e0e0; }

/* 暗色模式下预览横幅 */
.blog-detail-page.is-dark .preview-banner {
  background: linear-gradient(135deg, #2a2a1e, #3a3520);
  border-color: #b45309;
}
.blog-detail-page.is-dark .preview-text { color: #fbbf24; }
.blog-detail-page.is-dark .preview-back-btn { background: #2a2a2a; color: #fbbf24; border-color: #b45309; }
.blog-detail-page.is-dark .preview-back-btn:hover { background: #b45309; color: #fff; }
</style>
