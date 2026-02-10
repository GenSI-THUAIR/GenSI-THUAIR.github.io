<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NImage, NUpload, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import CosUploader from '@/components/common/CosUploader.vue';
import { 
  getProjects, 
  insertProject, 
  updateProject, 
  deleteProject ,
  deleteImage
} from '@/supabase/supabaseAction';

interface ProjectItem {
  id: string;
  title: string;
  title_cn?: string;
  cover: string;
  description: string;
  content_cn?: string;
  views: number;
  link_url?: string;
  lbtcontent?: string;
  lbtcontent_cn?: string;
  created_at?: string;
  sort?: number;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const quillEditor = ref();

const formData = reactive<Partial<ProjectItem>>({
  title: '',
  title_cn: '',
  cover: '',
  description: '',
  content_cn: '',
  views: 0,
  link_url: '',
  lbtcontent: '',
  lbtcontent_cn: '',
  sort: 0
});

const projectData = ref<ProjectItem[]>([]);

const columns: DataTableColumns<ProjectItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '项目图片',
    key: 'cover',
    width: 120,
    render(row) {
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
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '中文标题',
    key: 'title_cn',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '项目描述',
    key: 'description',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '外部链接',
    key: 'link_url',
    width: 120,
    render(row) {
      return row.link_url ? h(NButton, {
        size: 'small',
        tag: 'a',
        href: row.link_url,
        target: '_blank',
        type: 'primary',
        ghost: true
      }, { default: () => '查看链接' }) : '-';
    }
  },
  // {
  //   title: '浏览量',
  //   key: 'views',
  //   width: 100,
  //   render(row) {
  //     return row.views.toLocaleString();
  //   }
  // },
  {
    title: '排序',
    key: 'sort',
    width: 100,
    render(row) {
      return row.sort !== undefined ? row.sort : '-';
    }
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 150,
    render(row) {
      return row.created_at ? new Date(row.created_at).toLocaleDateString('zh-CN') : '-';
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
  let data = projectData.value;
  
  // 先按sort排序（数值越大排在前面），如果sort相同则按创建时间排序
  data = [...data].sort((a, b) => {
    const sortA = a.sort ?? -1; // 未设置sort的排在后面
    const sortB = b.sort ?? -1;
    
    if (sortA !== sortB) {
      return sortB - sortA; // 改为降序排列，数值大的在前
    }
    
    // sort相同时，按创建时间降序排列（最新的在前）
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return 0;
  });
  
  // 再进行搜索过滤
  if (!searchValue.value) return data;
  return data.filter(item => 
    item.title.includes(searchValue.value) || 
    (item.title_cn && item.title_cn.includes(searchValue.value)) ||
    item.description.includes(searchValue.value)
  );
});

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
  placeholder: '请输入项目描述...',
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
  placeholder: '请输入中文项目描述...',
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

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getProjects();
    projectData.value = data || [];
  } catch (error) {
    console.error('加载项目数据失败:', error);
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
    cover: '',
    description: '',
    content_cn: '',
    views: 0,
    link_url: '',
    lbtcontent: '',
    lbtcontent_cn: '',
    sort: 0
  });
  showModal.value = true;
}

function handleEdit(row: ProjectItem) {
  editMode.value = true;
  Object.assign(formData, row);
  showModal.value = true;
}

async function handleSave() {
  if (!formData.title || !formData.description) {
    $message.error('请填写必填项');
    return;
  }

  loading.value = true;
  try {
    const projectInfo = {
      title: formData.title,
      title_cn: formData.title_cn || '',
      cover: formData.cover || '',
      description: formData.description,
      content_cn: formData.content_cn || '',
      views: Number(formData.views) || 0,
      link_url: formData.link_url || '',
      lbtcontent: formData.lbtcontent || '',
      lbtcontent_cn: formData.lbtcontent_cn || '',
      sort: Number(formData.sort) || 0
    };

    if (editMode.value && formData.id) {
      // 更新项目
      await updateProject(formData.id, projectInfo);
      $message.success('更新成功');
    } else {
      // 新增项目
      await insertProject(projectInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存项目失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteProject(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除项目失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

const imageDelete = () => {
  console.log('出发删除',formData.id )
  deleteImage(formData.id , 'project','cover')
  formData.cover = ""
}

// 处理编辑器内容变化
const handleEditorChange = (content: string) => {
  formData.description = content;
};
</script>

<template>
  <div class="p-4">
    <NCard title="项目管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索英文标题、中文标题或描述"
            clearable
            style="width: 240px"
          />
          <NButton type="primary" @click="handleAdd">
            新增项目
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: ProjectItem) => row.id"
        :scroll-x="1200"
      />
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 1000px">
      <template #header>
        {{ editMode ? '编辑项目' : '新增项目' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="英文标题" path="title" required>
          <NInput v-model:value="formData.title" placeholder="请输入英文标题" />
        </NFormItem>
        
        <NFormItem label="中文标题" path="title_cn">
          <NSpace vertical style="width: 100%;">
          <NInput v-model:value="formData.title_cn" placeholder="请输入中文标题" />
          <div style="font-size: 12px; color: #999;">
              中英文显示规则：中英文内容都输入，则中英文都显示，只输入英文，则只显示英文，只输入中文，则只显示中文
            </div>
            </NSpace>
        </NFormItem>
        
        <NFormItem label="项目图片" path="cover">
          <NSpace vertical style="width: 100%;">
            <CosUploader v-model="formData.cover"
                prefix="project/cover/" 
                @imageDelete="imageDelete"  />
          </NSpace>
        </NFormItem>
        
        <NFormItem label="外部链接" path="link_url">
          <NInput v-model:value="formData.link_url" placeholder="请输入外部链接地址 (如：https://example.com)" />
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
              数值越大越靠前显示，建议设置为10的倍数便于调整顺序
            </div>
            </NSpace>
        </NFormItem>
        
        <NFormItem label="项目描述" path="description" required>
          <div class="editor-container">
            <QuillEditor
              ref="quillEditor"
              v-model:content="formData.description"
              :options="quillOptions"
              content-type="html"
              @update:content="handleEditorChange"
              style="height: 200px;"
            />
          </div>
        </NFormItem>

        <NFormItem label="中文描述" path="content_cn">
          <div class="editor-container">
            <QuillEditor
              v-model:content="formData.content_cn"
              :options="quillOptionsCn"
              content-type="html"
              style="height: 200px;"
            />
          </div>
        </NFormItem>
      </NForm>
      
      <template #action>
        <NSpace>
          <NButton @click="showModal = false">取消</NButton>
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