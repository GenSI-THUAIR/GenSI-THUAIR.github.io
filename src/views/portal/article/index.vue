<template>
  <div class="article-page">
    <!-- 使用现有的Header组件 -->
    <Header />
    
    <!-- 文章内容区域 -->
    <main class="article-main">
      <div class="container">
        <article class="article-content" v-if="article">
          <!-- 文章标题 -->
          <h1 class="article-title">
            {{ article.title }}
          </h1>
          
          <!-- 文章日期 -->
          <div class="article-date">{{ article.created_at.slice(0, 10) }}</div>
          
          <!-- 文章内容 -->
          <div class="article-body">
            <!-- 如果有PDF文件，显示PDF阅读器 -->
            <div v-if="isPdf && pdfUrl" class="pdf-viewer-container">
              <h2 class="section-title">PDF文档内容</h2>
              
              <div class="pdf-viewer" :class="{ 'fullscreen': isFullscreen }">
                <div class="pdf-embed-wrapper">
                  <VuePdfEmbed
                    :source="pdfUrl"
                    :page="currentPage"
                    :width="pdfWidth"
                    @loaded="onPdfLoaded"
                    @loading-failed="onPdfLoadingFailed"
                  />
                </div>
              </div>
              <div class="pdf-controls">
                <button 
                  @click="prevPage" 
                  :disabled="currentPage <= 1"
                  class="pdf-btn"
                >
                  上一页
                </button>
                <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                <button 
                  @click="nextPage" 
                  :disabled="currentPage >= totalPages"
                  class="pdf-btn"
                >
                  下一页
                </button>
                <button @click="toggleFullscreen" class="pdf-btn">
                  {{ isFullscreen ? '退出全屏' : '全屏' }}
                </button>
              </div>
            </div>
            
            <!-- 如果有Markdown文件，显示Markdown渲染器 -->
            <div v-else-if="isMarkdown && article.filepath" class="markdown-viewer-container">
              <h2 class="section-title">Markdown文档内容</h2>
              <div v-if="isLoadingMarkdown" class="markdown-loading">
                <div class="loading-spinner"></div>
                <p>正在加载Markdown内容...</p>
              </div>
              <div 
                v-else 
                class="markdown-content" 
                v-html="markdownContent"
              ></div>
            </div>
            
            <!-- 如果没有文件，显示普通文本内容 -->
            <div v-else-if="article.content" class="content-section">
              <div class="content-paragraph" v-html="article.content"></div>
            </div>
            
            <!-- 如果都没有，显示提示 -->
            <div v-else class="empty-content">
              <p>{{ $t('common.noData') }}</p>
            </div>
          </div>
        </article>
        
        <!-- 加载状态 -->
        <div v-else class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载文章...</p>
        </div>
      </div>
    </main>
    
    <!-- 使用现有的Footer组件 -->
    <Footer />
    
    <!-- 返回顶部按钮 -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import BackToTop from '../components/BackToTop.vue';
import supabase from '@/supabase/supabase';
import { ref, onMounted, computed, onUnmounted } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { useSeo } from '@/composables/useSeo';

useSeo({
  title: 'Articles',
  description: 'In-depth articles and insights from GenSI Lab researchers.',
  keywords: 'GenSI, articles, insights, AI research',
});
// @ts-ignore
import { marked } from 'marked';

interface Article {
  id: number;
  title: string;
  content?: string;
  created_at: string;
  pdf_url?: string;
  filepath?: string;
}

const article = ref<Article | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const isFullscreen = ref(false);
const pdfWidth = ref(600);
const markdownContent = ref<string>('');
const isLoadingMarkdown = ref(false);

// 计算文件类型
const fileType = computed(() => {
  if (!article.value?.filepath) return null;
  
  const extension = article.value.filepath.split('.').pop()?.toLowerCase();
  return extension;
});

// 计算是否为PDF文件
const isPdf = computed(() => {
  return fileType.value === 'pdf';
});

// 计算是否为Markdown文件
const isMarkdown = computed(() => {
  return fileType.value === 'md' || fileType.value === 'markdown';
});

// 计算PDF URL
const pdfUrl = computed(() => {
  if (!article.value) return null;
  
  // 如果有专门的pdf_url字段
  if (article.value.pdf_url) {
    return article.value.pdf_url;
  }
  
  // 如果filepath是PDF文件
  if (article.value.filepath && isPdf.value) {
    return article.value.filepath;
  }
  
  // 如果content字段包含PDF链接
  if (article.value.content) {
    const pdfMatch = article.value.content.match(/https?:\/\/[^\s]+\.pdf/i);
    if (pdfMatch) {
      return pdfMatch[0];
    }
  }
  
  return null;
});

// PDF控制函数
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  adjustPdfWidth();
};

// PDF加载成功回调
const onPdfLoaded = (pdf: any) => {
  totalPages.value = pdf.numPages;
  console.log('PDF loaded successfully:', pdf);
};

// PDF加载失败回调
const onPdfLoadingFailed = (error: any) => {
  console.error('PDF loading failed:', error);
};

// 获取并渲染Markdown内容
const loadMarkdownContent = async (url: string) => {
  if (!url) return;
  
  isLoadingMarkdown.value = true;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    markdownContent.value = marked(text);
  } catch (error) {
    console.error('Failed to load markdown:', error);
    markdownContent.value = '<p>加载Markdown内容失败</p>';
  } finally {
    isLoadingMarkdown.value = false;
  }
};

// 调整PDF宽度以适应窗口
const adjustPdfWidth = () => {
  if (isFullscreen.value) {
    pdfWidth.value = Math.min(window.innerWidth * 0.85, 1200);
  } else {
    const containerWidth = window.innerWidth > 1000 ? 800 : window.innerWidth * 0.9;
    pdfWidth.value = Math.min(containerWidth * 0.95, 700);
  }
};

onMounted(async () => {
  // 设置初始PDF宽度
  adjustPdfWidth();
  
  // 监听窗口大小变化
  window.addEventListener('resize', adjustPdfWidth);
  
  const { data, error } = await supabase.from('group').select('*').eq('id', 1).single();
  if (error) {
    console.error('Error fetching article:', error);
    return;
  }
  
  // 将数据转换为Article类型
  article.value = {
    ...data
  } as Article;
  
  console.log('Article loaded:', article.value);
  
  // 如果有markdown文件，加载并渲染内容
  if (article.value.filepath && isMarkdown.value) {
    await loadMarkdownContent(article.value.filepath);
  }
});

onUnmounted(() => {
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', adjustPdfWidth);
});

</script>

<style scoped>
@import '../assests/common.css';

.article-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.article-main {
  flex: 1;
  padding: 80px 0;
}

.article-content {
  max-width: 800px;
  margin: 0 auto;
}

.article-title {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 24px;
  color: #000000;
  font-family: 'Sora', sans-serif;
}

.article-date {
  font-size: 16px;
  color: #666666;
  margin-bottom: 48px;
  font-weight: 400;
}

.article-body {
  font-size: 16px;
  line-height: 1.6;
  color: #333333;
}

.content-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #000000;
  font-family: 'Sora', sans-serif;
}

.subsection-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  margin-top: 32px;
  color: #000000;
  font-family: 'Sora', sans-serif;
}

.third-level-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 24px;
  color: #000000;
  font-family: 'Sora', sans-serif;
}

.content-paragraph {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.8;
  color: #444444;
  font-family: 'Sora', sans-serif;
  text-align: justify;
}

/* PDF阅读器相关样式 */
.pdf-viewer-container {
  margin-top: 32px;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.pdf-btn {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.pdf-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.pdf-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.pdf-viewer {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 70vh;
}

.pdf-viewer.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 0;
  padding: 40px;
  max-height: none;
  min-height: none;
  overflow: hidden;
  align-items: center;
}

.pdf-embed-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
}

.empty-content {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Markdown渲染器样式 */
.markdown-viewer-container {
  margin-top: 32px;
}

.markdown-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.markdown-content {
  max-width: 100%;
  margin: 20px 0;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}

/* Markdown内容样式 */
.markdown-content h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #000;
  font-weight: 600;
  border-bottom: 3px solid #007bff;
  padding-bottom: 10px;
}

.markdown-content h2 {
  font-size: 2em;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #000;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 1.5em;
  margin-top: 24px;
  margin-bottom: 12px;
  color: #000;
  font-weight: 600;
}

.markdown-content h4 {
  font-size: 1.25em;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #000;
  font-weight: 600;
}

.markdown-content h5,
.markdown-content h6 {
  font-size: 1em;
  margin-top: 16px;
  margin-bottom: 8px;
  color: #000;
  font-weight: 600;
}

.markdown-content p {
  margin-bottom: 16px;
  line-height: 1.8;
  text-align: justify;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 16px;
  padding-left: 32px;
}

.markdown-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.markdown-content blockquote {
  margin: 20px 0;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  border-radius: 4px;
  font-style: italic;
}

.markdown-content pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 20px 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.markdown-content code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #d63384;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  color: #333;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #e9ecef;
  padding: 12px;
  text-align: left;
}

.markdown-content th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.markdown-content a {
  color: #007bff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}

.markdown-content a:hover {
  border-bottom-color: #007bff;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-content hr {
  border: none;
  border-top: 2px solid #e9ecef;
  margin: 32px 0;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .article-main {
    padding: 40px 0;
  }
  
  .article-title {
    font-size: 32px;
    margin-bottom: 16px;
  }
  
  .article-date {
    font-size: 14px;
    margin-bottom: 32px;
  }
  
  .section-title {
    font-size: 28px;
    margin-bottom: 24px;
  }
  
  .subsection-title {
    font-size: 20px;
    margin-bottom: 16px;
    margin-top: 24px;
  }
  
  .third-level-title {
    font-size: 16px;
    margin-bottom: 12px;
    margin-top: 20px;
  }
  
  .content-paragraph {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .pdf-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .pdf-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .pdf-viewer {
    padding: 10px;
    max-height: 60vh;
    min-height: 50vh;
    overflow: hidden;
  }
  
  .pdf-viewer.fullscreen {
    padding: 20px;
    overflow: hidden;
  }
  
  .pdf-embed-wrapper {
    max-width: 100%;
    max-height: 100%;
  }
  
  .markdown-content {
    padding: 16px;
    margin: 16px 0;
  }
  
  .markdown-content h1 {
    font-size: 2em;
    margin-bottom: 16px;
  }
  
  .markdown-content h2 {
    font-size: 1.5em;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  
  .markdown-content h3 {
    font-size: 1.25em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .markdown-content pre {
    padding: 12px;
    font-size: 13px;
    overflow-x: auto;
  }
  
  .markdown-content table {
    font-size: 12px;
    margin: 16px 0;
  }
  
  .markdown-content th,
  .markdown-content td {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 24px;
    line-height: 1.3;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .subsection-title {
    font-size: 18px;
  }
  
  .pdf-viewer {
    padding: 5px;
    max-height: 50vh;
    min-height: 40vh;
    overflow: hidden;
  }
  
  .pdf-embed-wrapper {
    max-width: 100%;
    max-height: 100%;
  }
  
  .markdown-content {
    padding: 12px;
    margin: 12px 0;
  }
  
  .markdown-content h1 {
    font-size: 1.8em;
    margin-bottom: 12px;
  }
  
  .markdown-content h2 {
    font-size: 1.3em;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .markdown-content h3 {
    font-size: 1.1em;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  
  .markdown-content pre {
    padding: 10px;
    font-size: 12px;
  }
  
  .markdown-content table {
    font-size: 11px;
    margin: 12px 0;
  }
  
  .markdown-content th,
  .markdown-content td {
    padding: 6px;
  }
  
  .markdown-content p,
  .markdown-content li {
    font-size: 14px;
  }
}
</style>
