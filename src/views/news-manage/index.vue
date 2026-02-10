<script setup lang="ts">
import { ref, reactive, onMounted, computed, h, nextTick,watch } from 'vue';
import {
  NCard, NInput, NButton, NSpace, NIcon, NDataTable, NModal, NForm,
  NFormItem, NUpload, NImage, NInputNumber, useMessage
} from 'naive-ui';
import type { DataTableColumns, UploadFileInfo, UploadOnChange } from 'naive-ui';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import CosUploader from '@/components/common/CosUploader.vue';
import {
  getNews,
  insertNews,
  updateNews,
  deleteNews,
  deleteImage
} from '@/supabase/supabaseAction';
import  supabase  from '@/supabase/supabase';

interface NewsItem {
  id: string;
  title: string;
  title_cn?: string;
  content: string;
  content_cn?: string;
  cover?: string;
  news_link?: string;
  time?: string;
  created_by: string;
  views: number;
  create_time: string;
  lbtcontent?: string;
  lbtcontent_cn?: string;
  sort?: number;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const quillEditor = ref();

const formData = reactive<Partial<NewsItem>>({
  title: '',
  title_cn: '',
  content: '',
  content_cn: '',
  cover: '',
  news_link: '',
  time: '',
  created_by: '',
  views: 0,
  lbtcontent: '',
  lbtcontent_cn: '',
  sort: 0
});

const newsData = ref<NewsItem[]>([]);

// Quill 编辑器配置
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  },
  placeholder: '请输入新闻内容...',
  readOnly: false
};

// 中文版 Quill 编辑器配置
const quillOptionsCn = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  },
  placeholder: '请输入中文新闻内容...',
  readOnly: false
};

// 轮播图描述编辑器配置
const quillOptionsCarousel = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  },
  placeholder: '请输入轮播图描述...',
  readOnly: false
};

// 轮播图中文描述编辑器配置
const quillOptionsCarouselCn = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  },
  placeholder: '请输入中文轮播图描述...',
  readOnly: false
};

const columns: DataTableColumns<NewsItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '封面图片',
    key: 'cover',
    width: 120,
    render(row) {
      return row.cover ? h(NImage, {
        width: 60,
        height: 40,
        src: row.cover,
        style: 'object-fit: cover; border-radius: 4px;'
      }) : '无图片';
    }
  },
  {
    title: '新闻链接',
    key: 'news_link',
    width: 120,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row.news_link ? h('a', {
        href: row.news_link,
        target: '_blank',
        style: 'color: #18a058; text-decoration: underline;'
      }, '查看链接') : '无链接';
    }
  },
  {
    title: '时间',
    key: 'time',
    width: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '创建人',
    key: 'created_by',
    width: 120
  },
  {
    title: '排序',
    key: 'sort',
    width: 120,
    render(row) {
      return row.sort !== undefined ? row.sort : '-';
    }
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 180,
    render(row) {
      return row.create_time ? new Date(row.create_time).toLocaleString() : '-';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => handleEdit(row)
          }, { default: () => '编辑' }),
          h(NButton, {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row.id)
          }, { default: () => '删除' })
        ]
      });
    }
  }
];

const filteredData = computed(() => {
  let data = newsData.value;
  
  // 先按sort排序（数值越小排在前面），如果sort相同则按创建时间排序
  data = [...data].sort((a, b) => {
    const sortA = a.sort ?? 999999; // 未设置sort的排在后面
    const sortB = b.sort ?? 999999;
    
    if (sortA !== sortB) {
      return sortA - sortB;
    }
    
    // sort相同时，按创建时间降序排列（最新的在前）
    if (a.create_time && b.create_time) {
      return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
    }
    
    return 0;
  });
  
  // 再进行搜索过滤
  if (!searchValue.value) return data;
  return data.filter(item =>
    item.title.includes(searchValue.value) ||
    item.created_by.includes(searchValue.value)
  );
});

// 处理编辑器内容变化
const handleEditorChange = (content: string) => {
  formData.content = content;
};

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getNews();
    newsData.value = data || [];
  } catch (error) {
    console.error('加载新闻数据失败:', error);
    $message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    title: '',
    title_cn: '',
    content: '',
    content_cn: '',
    cover: '',
    news_link: '',
    time: '',
    created_by: '',
    views: 0,
    lbtcontent: '',
    lbtcontent_cn: '',
    sort: 0
  });
  showModal.value = true;
}

function handleEdit(row: NewsItem) {
  editMode.value = true;
  Object.assign(formData, row);
  showModal.value = true;
}

async function handleSave() {
  if ( !formData.content) {
    $message.error('请填写必填字段');
    return;
  }
  loading.value = true;
  try {
    const newsData = {
      title: formData.title,
      title_cn: formData.title_cn || '',
      content: formData.content,
      content_cn: formData.content_cn,
      cover: formData.cover,
      news_link: formData.news_link,
      time: formData.time,
      created_by: 'admin',
      views: 0,
      lbtcontent: formData.lbtcontent || '',
      lbtcontent_cn: formData.lbtcontent_cn || '',
      sort: Number(formData.sort) || 0
    };

    if (editMode.value && formData.id) {
      // 更新新闻
      //await updateNews(formData.id, newsData);
      const { data, error } = await supabase.from('news').update(newsData).eq('id', formData.id);
    } else {
      // 新增新闻
      await insertNews({
        ...newsData,
        create_time: new Date().toISOString()
      });
    }

    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存新闻失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteNews(id);
    await loadData(); // 重新加载数据
    $message.success('删除成功');
  } catch (error) {
    console.error('删除新闻失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

const handleModalClose = () => {
  showModal.value = false;
};

onMounted(() => {
  loadData();
});

// v-model 绑定的文件列表
const imageDelete = () => {
  console.log('出发删除',formData.id )
  deleteImage(formData.id , 'news','cover')
  formData.cover = ""
}
</script>

<template>
  <div class="p-4">
    <NCard title="新闻管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索新闻标题或创建人"
            clearable
            style="width: 200px"
          />
          <NButton type="primary" @click="handleAdd">
            新增新闻
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: NewsItem) => row.id"
        :scroll-x="1200"
      />
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal
      v-model:show="showModal"
      preset="dialog"
      style="width: 900px; max-height: 90vh;"
      @close="handleModalClose"
    >
      <template #header>
        {{ editMode ? '编辑新闻' : '新增新闻' }}
      </template>

      <div style="max-height: 70vh; overflow-y: auto; padding-right: 12px;">
        <NForm
          :model="formData"
          label-placement="left"  
          label-width="120px"
          require-mark-placement="right-hanging"
        >
          <NFormItem label="英文标题" path="title">
            <NInput v-model:value="formData.title" placeholder="请输入英文新闻标题" />
          </NFormItem>
          
          <NFormItem label="中文标题" path="title_cn">
            <NSpace vertical style="width: 100%;">
              <NInput v-model:value="formData.title_cn" placeholder="请输入中文新闻标题" />
              <div style="font-size: 12px; color: #999;">
                中英文显示规则：中英文标题都输入，则中英文都显示，只输入英文，则只显示英文，只输入中文，则只显示中文
              </div>
            </NSpace>
          </NFormItem>
          

          <NFormItem label="封面图片" path="cover">
            <NSpace vertical style="width: 100%">
              <CosUploader v-model="formData.cover"
                prefix="news/cover/" 
                @imageDelete="imageDelete"  />
            </NSpace>
          </NFormItem>

          <NFormItem label="新闻链接" path="news_link">
            <NInput v-model:value="formData.news_link" placeholder="请输入新闻链接 (可选)" />
          </NFormItem>

          <NFormItem label="时间" path="time">
            <NInput v-model:value="formData.time" placeholder="请输入时间 (可选)" />
          </NFormItem>

          <NFormItem label="排序" path="sort">
            <NSpace vertical style="width: 100%;">
            <NInputNumber 
              v-model:value="formData.sort" 
              :min="0" 
              placeholder="请输入排序数值，数值越大排序越靠前" 
              style="width: 100%"
            />
            <div style="font-size: 12px; color: #999;">
              数值越大越靠前显示，数值相同按上面的时间判断显示
            </div>
            </NSpace>
          </NFormItem>

          <!-- <NFormItem label="创建人" path="created_by" required>
            <NInput v-model:value="formData.created_by" placeholder="请输入创建人姓名" />
          </NFormItem> -->

          <!-- <NFormItem label="浏览量" path="views">
            <NInputNumber v-model:value="formData.views" :min="0" placeholder="浏览量" />
          </NFormItem> -->

          <NFormItem label="英文内容" path="content" required>
            <div class="editor-container">
              <QuillEditor
                ref="quillEditor"
                v-model:content="formData.content"
                :options="quillOptions"
                content-type="html"
                @update:content="handleEditorChange"
                style="height: 150px;"
              />
            </div>
          </NFormItem>

          <NFormItem label="中文内容" path="content_cn">
            <div class="editor-container">
              <QuillEditor
                v-model:content="formData.content_cn"
                :options="quillOptionsCn"
                content-type="html"
                style="height: 150px;"
              />
            </div>
          </NFormItem>
          
          <!-- <NFormItem label="轮播图描述" path="lbtcontent">
            <div class="editor-container">
              <QuillEditor
                v-model:content="formData.lbtcontent"
                :options="quillOptionsCarousel"
                content-type="html"
                style="height: 150px;"
              />
            </div>
          </NFormItem>
          
          <NFormItem label="轮播图描述(中文)" path="lbtcontent_cn">
            <div class="editor-container">
              <QuillEditor
                v-model:content="formData.lbtcontent_cn"
                :options="quillOptionsCarouselCn"
                content-type="html"
                style="height: 150px;"
              />
            </div>
          </NFormItem> -->
        </NForm>
      </div>

      <template #action>
        <NSpace>
          <NButton @click="handleModalClose">取消</NButton>
          <NButton type="primary" @click="handleSave" :loading="loading">确定</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 16px;
}

.editor-container {
  width: 100%;
  border: 1px solid #e0e0e6;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.ql-toolbar) {
  border-bottom: 1px solid #e0e0e6;
  background-color: #fafafa;
}

:deep(.ql-container) {
  border: none;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.ql-editor) {
  min-height: 120px;
  padding: 16px;
}

:deep(.ql-editor.ql-blank::before) {
  color: #c2c2c2;
  font-style: normal;
}

:deep(.ql-snow .ql-tooltip) {
  z-index: 9999;
}
</style>
