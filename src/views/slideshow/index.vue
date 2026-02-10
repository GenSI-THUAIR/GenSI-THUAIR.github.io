<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NInputNumber, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NImage, useMessage
} from 'naive-ui';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import type { DataTableColumns } from 'naive-ui';
import CosUploader from '@/components/common/CosUploader.vue';
import { 
  fetchSlideshowList, 
  createSlideshow, 
  updateSlideshow as updateSlideshowApi, 
  deleteSlideshow as deleteSlideshowApi 
} from '@/service/api/slideshow';
import { 
  deleteImage
} from '@/supabase/supabaseAction';

type SlideshowItem = Api.Slideshow.SlideshowItem;

// 表单数据类型，轮播图管理
type SlideshowFormData = Partial<SlideshowItem> & {
  cover?: string; // 封面图片
  title?: string; // 英文标题
  title_cn?: string; // 中文标题
  description?: string; // 英文描述
  description_cn?: string; // 中文描述
  link_url?: string; // 链接地址
  sort?: number; // 排序值（数值越大越靠前）
};

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<string[]>([]);
const quillEditor = ref();

const formData = reactive<SlideshowFormData>({
  cover: '',
  title: '',
  title_cn: '',
  description: '',
  description_cn: '',
  link_url: '',
  sort: 0
});

const slideshowData = ref<SlideshowItem[]>([]);

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
      ['link']
    ]
  },
  placeholder: '请输入内容...'
};

const columns: DataTableColumns<SlideshowItem> = [
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
        width: 80,
        height: 60,
        objectFit: 'cover',
        style: 'border-radius: 4px;'
      }) : '暂无图片';
    }
  },
  {
    title: '英文标题',
    key: 'title',
    width: 180,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      const title = row.title || '';
      return title.length > 30 ? title.substring(0, 30) + '...' : title || '-';
    }
  },
  {
    title: '中文标题',
    key: 'title_cn',
    width: 180,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      const title_cn = row.title_cn || '';
      return title_cn.length > 30 ? title_cn.substring(0, 30) + '...' : title_cn || '-';
    }
  },
  {
    title: '英文描述',
    key: 'description',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      const description = row.description || '';
      return description.length > 50 ? description.substring(0, 50) + '...' : description;
    }
  },
  {
    title: '中文描述',
    key: 'description_cn',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      const description_cn = row.description_cn || '';
      return description_cn.length > 50 ? description_cn.substring(0, 50) + '...' : description_cn;
    }
  },
  {
    title: '链接地址',
    key: 'link_url',
    width: 150,
    render(row) {
      if (!row) return '-';
      if (!row.link_url) return '-';
      
      return h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => window.open(row.link_url, '_blank')
      }, { 
        default: () => '访问链接'
      });
    }
  },
  {
    title: '排序值',
    key: 'sort',
    width: 100,
    sorter: true,
    render(row) {
      if (!row) return '-';
      return row.sort || 0;
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
  if (!searchValue.value) return slideshowData.value;
  return slideshowData.value.filter(item => 
    item && // 确保 item 不为 null
    (item.title?.includes(searchValue.value) ||
     item.title_cn?.includes(searchValue.value) ||
     item.description?.includes(searchValue.value) || 
     item.description_cn?.includes(searchValue.value) ||
     item.link_url?.includes(searchValue.value))
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await fetchSlideshowList();
    // 确保数据安全，过滤掉无效数据
    slideshowData.value = (data || []).filter(item => item && item.id);
  } catch (error) {
    console.error('加载轮播图数据失败:', error);
    $message.error('加载数据失败');
    slideshowData.value = []; // 确保在错误时设置为空数组
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    cover: '',
    title: '',
    title_cn: '',
    description: '',
    description_cn: '',
    link_url: '',
    sort: 0
  });
  showModal.value = true;
}

function handleEdit(row: SlideshowItem) {
  editMode.value = true;
  Object.assign(formData, {
    ...row,
    cover: row.cover || '',
    title: row.title || '',
    title_cn: row.title_cn || '',
    description: row.description || '',
    description_cn: row.description_cn || '',
    link_url: row.link_url || '',
    sort: row.sort || 0
  });
  showModal.value = true;
}

async function handleSave() {
  if (!formData.cover || !formData.description || !formData.description_cn || !formData.link_url) {
    $message.error('请填写所有必填字段');
    return;
  }

  // 验证排序值
  if (formData.sort === undefined || formData.sort === null || formData.sort < 0) {
    $message.error('排序值必须是大于等于0的数字');
    return;
  }

  loading.value = true;
  try {
    const slideshowInfo = {
      cover: formData.cover,
      title: formData.title || '',
      title_cn: formData.title_cn || '',
      description: formData.description,
      description_cn: formData.description_cn,
      link_url: formData.link_url,
      sort: formData.sort
    };

    if (editMode.value && formData.id) {
      // 更新轮播图
      await updateSlideshowApi(formData.id, slideshowInfo);
      $message.success('更新成功');
    } else {
      // 新增轮播图
      await createSlideshow(slideshowInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存轮播图失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteSlideshowApi(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除轮播图失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    $message.warning('请选择要删除的项目');
    return;
  }

  loading.value = true;
  try {
    // 并行删除所有选中的项目
    await Promise.all(
      selectedRowKeys.value.map(id => deleteSlideshowApi(id))
    );
    $message.success(`成功删除 ${selectedRowKeys.value.length} 个项目`);
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
  deleteImage(formData.id , 'slideshow','cover')
  formData.cover = ""
}
</script>

<template>
  <div class="p-4">
    <NCard title="轮播图管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索标题、描述、链接等"
            clearable
            style="width: 300px"
          />
          <NButton 
            type="error" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </NButton>
          <NButton type="primary" @click="handleAdd">
            新增轮播图
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: SlideshowItem) => row?.id || ''"
        :scroll-x="1200"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
      >
      </NDataTable>
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 800px">
      <template #header>
        {{ editMode ? '编辑轮播图' : '新增轮播图' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="封面图片" path="cover" required>
          <NSpace vertical style="width: 100%;">
            <CosUploader v-model="formData.cover"
                prefix="slideshow/cover/" 
                @imageDelete="imageDelete"  />
          </NSpace>
        </NFormItem>
        
        <NFormItem label="英文标题" path="title">
          <NInput
            v-model:value="formData.title"
            placeholder="请输入英文标题（可选）"
            maxlength="200"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="中文标题" path="title_cn">
          <NInput
            v-model:value="formData.title_cn"
            placeholder="请输入中文标题（可选）"
            maxlength="200"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="英文描述" path="description" required>
          <div class="editor-container">
            <QuillEditor
              ref="quillEditor"
              v-model:content="formData.description"
              :options="quillOptions"
              content-type="html"
              style="height: 200px;"
            />
          </div>
        </NFormItem>
        
        <NFormItem label="中文描述" path="description_cn" required>
          <div class="editor-container">
            <QuillEditor
              v-model:content="formData.description_cn"
              :options="quillOptions"
              content-type="html"
              style="height: 200px;"
            />
          </div>
        </NFormItem>
        
        <NFormItem label="链接地址" path="link_url" required>
          <NInput
            v-model:value="formData.link_url"
            placeholder="请输入链接地址"
            maxlength="500"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="排序值" path="sort" required>
          <NSpace vertical style="width: 100%;">
            <NInputNumber
              v-model:value="formData.sort"
              placeholder="请输入排序值"
              :min="0"
              :max="9999"
              :step="1"
              style="width: 100%;"
            />
            <div style="font-size: 12px; color: #999;">
              数值越大越靠前显示，建议设置为10的倍数便于调整顺序
            </div>
          </NSpace>
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
  border-radius: 4px;
  overflow: hidden;
}

.editor-container :deep(.ql-editor) {
  min-height: 150px;
  font-size: 14px;
  line-height: 1.5;
}

.editor-container :deep(.ql-toolbar) {
  border-bottom: 1px solid #e0e0e6;
  background-color: #fafafa;
}
</style>