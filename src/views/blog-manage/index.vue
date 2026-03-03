<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NImage, NTag, NDatePicker, NSelect, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import CosUploader from '@/components/common/CosUploader.vue';
import { 
  fetchBlogList, 
  createBlog, 
  updateBlog as updateBlogApi, 
  deleteBlog as deleteBlogApi,
} from '@/service/api/blog';
import { 
  deleteImage
} from '@/supabase/supabaseAction';

type BlogItem = Api.Blog.BlogItem;

// 表单数据类型，time字段支持NDatePicker的类型
type BlogFormData = Omit<Partial<BlogItem>, 'time'> & {
  time?: number | null;
  link_url?: string; // 外部链接
  type?: string; // 分区类型
  title_cn?: string; // 中文标题
};

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<string[]>([]);
const quillEditor = ref();

// 分区类型选项
const typeOptions = [
  { label: '根思五分钟系列', value: '根思五分钟系列' },
  { label: '根思深度系列', value: '根思深度系列' }
];

const formData = reactive<BlogFormData>({
  title: '',
  title_cn: '',
  content: '',
  cover: '',
  create_by: '',
  time: null,
  link_url: '',
  type: '根思五分钟系列'
});

const blogData = ref<BlogItem[]>([]);

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
  placeholder: '请输入博客内容...',
  readOnly: false
};

const columns: DataTableColumns<BlogItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '封面图片',
    key: 'cover',
    width: 120,
    render(row) {
      if (!row) return '数据错误';
      return row.cover ? h(NImage, {
        src: row.cover,
        width: 60,
        height: 40,
        objectFit: 'cover',
        style: 'border-radius: 4px;'
      }) : '暂无图片';
    }
  },
  {
    title: '英文标题',
    key: 'title',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.title || '-';
    }
  },
  {
    title: '中文标题',
    key: 'title_cn',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.title_cn || '-';
    }
  },
  {
    title: '分区类型',
    key: 'type',
    width: 120,
    render(row) {
      if (!row || !row.type) return '-';
      return h(NTag, {
        type: row.type === '根思五分钟系列' ? 'success' : 'warning',
        size: 'small'
      }, { default: () => row.type });
    }
  },
  {
    title: '内容/链接',
    key: 'content_or_link',
    width: 300,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      
      if (row.link_url) {
        return h('a', {
          href: row.link_url,
          target: '_blank',
          style: 'color: #2080f0; text-decoration: none;'
        }, '查看外部链接');
      }
      
      return '-';
    }
  },
  {
    title: '创建者',
    key: 'create_by',
    width: 120,
    render(row) {
      if (!row) return '-';
      return h(NTag, {
        type: 'info',
        size: 'small'
      }, { default: () => row.create_by || '未知' });
    }
  },
  {
    title: '发布时间',
    key: 'time',
    width: 120,
    render(row) {
      return row?.time || '-';
    }
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 150,
    render(row) {
      if (!row) return '-';
      return row.created_at ? new Date(row.created_at).toLocaleDateString('zh-CN') : '-';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render(row) {
      if (!row || !row.id) return '-';
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
  let data = blogData.value;
  
  // 如果有搜索条件，先进行过滤
  if (searchValue.value) {
    data = data.filter(item => 
      item && // 确保 item 不为 null
      (item.title?.includes(searchValue.value) || 
       item.title_cn?.includes(searchValue.value) ||
       item.content?.includes(searchValue.value) ||
       item.create_by?.includes(searchValue.value) ||
       item.type?.includes(searchValue.value))
    );
  }
  
  // 按发布时间降序排序，最新的在最上面
  return data.sort((a, b) => {
    if (!a?.time && !b?.time) return 0;
    if (!a?.time) return 1;
    if (!b?.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
});

// 处理编辑器内容变化
const handleEditorChange = (content: string) => {
  formData.content = content;
};

// 两种类型都显示外部链接字段
const showLinkField = computed(() => true);

// 不再显示富文本内容字段
const showContentField = computed(() => false);

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await fetchBlogList();
    // 确保数据安全，过滤掉无效数据
    blogData.value = (data || []).filter(item => item && item.id);
  } catch (error) {
    console.error('加载博客数据失败:', error);
    $message.error('加载数据失败');
    blogData.value = []; // 确保在错误时设置为空数组
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
    cover: '',
    create_by: '',
    time: null,
    link_url: '',
    type: '根思五分钟系列'
  });
  showModal.value = true;
}

function handleEdit(row: BlogItem) {
  editMode.value = true;
  // 处理时间格式，将字符串时间转换为时间戳供NDatePicker使用
  let timeValue: number | null = null;
  if (row.time && isValidDate(row.time)) {
    // 使用本地时间创建Date对象，避免时区偏移
    const [year, month, day] = row.time.split('-').map(Number);
    timeValue = new Date(year, month - 1, day).getTime();
  }
  
  Object.assign(formData, {
    ...row,
    time: timeValue,
    type: row.type || '根思五分钟系列' // 如果没有类型，默认为根思五分钟系列
  });
  showModal.value = true;
}

// 验证日期格式是否有效
function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  // 检查是否为 YYYY-MM-DD 格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  // 检查日期是否有效
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

async function handleSave() {


  loading.value = true;
  try {
    // 处理时间格式
    let timeValue = '';
    if (formData.time) {
      if (typeof formData.time === 'number') {
        // 如果是时间戳，转换为本地日期字符串，避免时区问题
        const date = new Date(formData.time);
        timeValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (typeof formData.time === 'string') {
        timeValue = formData.time;
      }
    } else {
      // 使用本地时间而不是UTC时间
      const now = new Date();
      timeValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    console.log('timeValue',timeValue)

    const blogInfo = {
      title: formData.title || '',
      title_cn: formData.title_cn || '',
      content: '',
      cover: formData.cover || '',
      create_by: formData.create_by || '管理员',
      time: timeValue,
      link_url: formData.link_url || '',
      type: formData.type || '根思五分钟系列'
    };

    if (editMode.value && formData.id) {
      // 更新博客
      await updateBlogApi(formData.id, blogInfo);
      $message.success('更新成功');
    } else {
      // 新增博客
      await createBlog(blogInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存博客失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteBlogApi(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除博客失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    $message.warning('请选择要删除的博客');
    return;
  }

  loading.value = true;
  try {
    // 并行删除所有选中的博客
    await Promise.all(
      selectedRowKeys.value.map(id => deleteBlogApi(id))
    );
    $message.success(`成功删除 ${selectedRowKeys.value.length} 篇博客`);
    selectedRowKeys.value = [];
    await loadData();
  } catch (error) {
    console.error('批量删除失败:', error);
    $message.error('批量删除失败');
  } finally {
    loading.value = false;
  }
}

// 处理行选择
function handleCheck(rowKeys: (string | number)[]) {
  selectedRowKeys.value = rowKeys.map(key => String(key));
}

onMounted(() => {
  loadData();
});

const imageDelete = () => {
  console.log('出发删除',formData.id )
  deleteImage(formData.id , 'blog','cover')
  formData.cover = ""
}
</script>

<template>
  <div class="p-4">
    <NCard title="博客管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索标题、中文标题、内容或创建者"
            clearable
            style="width: 280px"
          />
          <NButton 
            type="error" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </NButton>
          <NButton type="primary" @click="handleAdd">
            新增博客
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: BlogItem) => row?.id || ''"
        :scroll-x="1400"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
      >
      </NDataTable>
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 900px">
      <template #header>
        {{ editMode ? '编辑博客' : '新增博客' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="100px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="英文标题" path="title">
          <NInput 
            v-model:value="formData.title" 
            placeholder="请输入英文博客标题" 
            maxlength="200"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="中文标题" path="title_cn">
          <NSpace vertical style="width: 100%;">
          <NInput 
            v-model:value="formData.title_cn" 
            placeholder="请输入中文博客标题" 
            maxlength="200"
            show-count
          />
          <div style="font-size: 12px; color: #999;">
              中英文显示规则：中英文内容都输入，则中英文都显示，只输入英文，则只显示英文，只输入中文，则只显示中文
            </div>
            </NSpace>
        </NFormItem>
        
        <NFormItem label="封面图片" path="cover">
          <NSpace vertical style="width: 100%;">
            <CosUploader v-model="formData.cover"
                prefix="blog/cover/" 
                @imageDelete="imageDelete"  />
          </NSpace>
        </NFormItem>
        
        <NFormItem label="分区类型" path="type" required>
          <NSelect
            v-model:value="formData.type"
            :options="typeOptions"
            placeholder="请选择分区类型"
          />
        </NFormItem>

        <NFormItem v-if="showContentField" label="内容" path="content">
          <div class="editor-container">
            <QuillEditor
              ref="quillEditor"
              v-model:content="formData.content"
              :options="quillOptions"
              content-type="html"
              @update:content="handleEditorChange"
              style="height: 400px;"
            />
          </div>
        </NFormItem>

        <NFormItem v-if="showLinkField" label="外部链接" path="link_url">
          <NInput
            v-model:value="formData.link_url"
            placeholder="请输入外部链接，如：https://example.com"
            maxlength="500"
          />
        </NFormItem>
        
        <NFormItem label="创建者" path="create_by">
          <NInput
            v-model:value="formData.create_by"
            placeholder="请输入创建者姓名"
            maxlength="50"
          />
        </NFormItem>
        
        <NFormItem label="发布时间" path="time">
          <NDatePicker
            v-model:value="formData.time"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="请选择发布时间"
            style="width: 100%"
            clearable
          />
        </NFormItem>

      </NForm>
      
      <template #action>
        <NSpace>
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="handleSave" :loading="loading">
            {{ editMode ? '更新' : '创建' }}
          </NButton>
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
  min-height: 300px;
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