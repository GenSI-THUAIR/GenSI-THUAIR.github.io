<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NImage, NTag, NDatePicker, NCheckboxGroup, NCheckbox, useMessage,
  NUpload, NUploadDragger, NProgress, NAlert, NText, NSelect, NInputNumber
} from 'naive-ui';
import type { DataTableColumns, UploadFileInfo } from 'naive-ui';
import CosUploader from '@/components/common/CosUploader.vue';
import { 
  fetchPublicationList, 
  createPublication, 
  updatePublication as updatePublicationApi, 
  deletePublication as deletePublicationApi 
} from '@/service/api/publication';
import { 
  deleteImage
} from '@/supabase/supabaseAction';
import { importBibTeXFromFile } from '@/utils/import-bibtex';

type PublicationItem = Api.Publication.PublicationItem;

// 表单数据类型，date字段支持NDatePicker的类型，tags字段为数组
type PublicationFormData = Omit<Partial<PublicationItem>, 'date' | 'tag'> & {
  date?: number | null;
  tags?: string[]; // 改为数组类型用于多选
  link_url?: string; // 文章链接
  author?: string; // 作者
  booktitle?: string; // 书籍标题/会议名称
  code_url?: string; // 代码链接
  bib?: string; // 参考文献引用
  sort?: number; // 排序字段
  meeting?: string; // 来源会议
  year?: string; // 年份
};

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<string[]>([]);

// BibTeX import related
const showImportModal = ref(false);
const importLoading = ref(false);
const importProgress = ref(0);
const importTotal = ref(0);
const importCurrent = ref(0);
const importCurrentItem = ref('');
const importResult = ref<{ success: number; errors: string[] } | null>(null);
const showImportResult = ref(false);

// 预定义的标签选项
const tagOptions = [
  { label: 'Mol', value: 'Mol' },
  { label: 'LLM', value: 'LLM' },
  { label: 'BFN', value: 'BFN' },
  { label: 'Diffusion', value: 'Diffusion' }
];

const formData = reactive<PublicationFormData>({
  title: '',
  content: '',
  cover: '',
  tags: [], // 改为数组
  link_url: '', // 添加链接字段
  author: '', // 添加作者字段
  booktitle: '', // 书籍标题/会议名称
  code_url: '', // 代码链接
  bib: '', // 参考文献引用
  sort: 0, // 排序字段
  meeting: '', // 来源会议
  year: '', // 年份
  date: null
});

// 会议选项数据
const meetingOptions = ref([
  { value: 'ACL', label: 'ACL' },
  { value: 'ICLR', label: 'ICLR' },
  { value: 'ICML', label: 'ICML' },
  { value: 'NeurIPS', label: 'NeurIPS' },
  { value: 'ACL Oral', label: 'ACL Oral' },
  { value: 'ACL Spotlight', label: 'ACL Spotlight' },
  { value: 'ICLR Oral', label: 'ICLR Oral' },
  { value: 'ICLR Spotlight', label: 'ICLR Spotlight' },
  { value: 'ICML Oral', label: 'ICML Oral' },
  { value: 'ICML Spotlight', label: 'ICML Spotlight' }
])
// 处理会议选择变化，支持手动新增
const handleMeetingChange = (value: string) => {
  if (value && !meetingOptions.value.find(item => item.value === value)) {
    meetingOptions.value.push({
      value: value,
      label: value
    })
  }
}


const publicationData = ref<PublicationItem[]>([]);

const columns: DataTableColumns<PublicationItem> = [
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
    title: '标题',
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
    title: '作者',
    key: 'author',
    width: 120,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.author || '-';
    }
  },
  {
    title: '内容',
    key: 'content',
    width: 250,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      // 截取内容前50个字符显示
      const content = row.content || '';
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
  },
  {
    title: '标签',
    key: 'tag',
    width: 150,
    render(row) {
      if (!row) return '-';
      if (!row.tag) return '-';
      
      // 将字符串标签分割为数组并渲染为多个标签
      const tags = row.tag.split(',').filter(tag => tag.trim());
      return h(NSpace, { size: 'small' }, {
        default: () => tags.map(tag => 
          h(NTag, {
            type: 'info',
            size: 'small',
            key: tag
          }, { default: () => tag.trim() })
        )
      });
    }
  },
  {
    title: '代码链接',
    key: 'code_url',
    width: 120,
    render(row) {
      if (!row) return '-';
      if (!row.code_url) return '-';
      
      return h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => window.open(row.code_url, '_blank')
      }, { 
        default: () => '查看代码'
      });
    }
  },
  {
    title: '文章链接',
    key: 'link_url',
    width: 120,
    render(row) {
      if (!row) return '-';
      if (!row.link_url) return '-';
      
      return h(NButton, {
        text: true,
        type: 'primary',
        size: 'small',
        onClick: () => window.open(row.link_url, '_blank')
      }, { 
        default: () => '查看文章'
      });
    }
  },
  {
    title: '发布日期',
    key: 'date',
    width: 120,
    render(row) {
      return row?.date || '-';
    }
  },
  {
    title: '排序',
    key: 'sort',
    width: 80,
    render(row) {
      return (row as any)?.sort || 0;
    }
  },
  {
    title: '来源会议',
    key: 'meeting',
    width: 120,
    render(row) {
      if (!(row as any)?.meeting) return '-';
      
      return h(NTag, {
        type: 'info',
        size: 'small'
      }, { default: () => (row as any).meeting });
    }
  },
  {
    title: '年份',
    key: 'year',
    width: 80,
    render(row) {
      return (row as any)?.year || '-';
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
  if (!searchValue.value) return publicationData.value;
  return publicationData.value.filter(item => 
    item && // 确保 item 不为 null
    (item.title?.includes(searchValue.value) || 
     item.content?.includes(searchValue.value) ||
     item.tag?.includes(searchValue.value) ||
     item.link_url?.includes(searchValue.value) ||
     item.author?.includes(searchValue.value) ||
     item.booktitle?.includes(searchValue.value) ||
     item.code_url?.includes(searchValue.value) ||
     item.bib?.includes(searchValue.value) ||
     (item as any).meeting?.includes(searchValue.value) ||
     (item as any).year?.includes(searchValue.value))
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await fetchPublicationList();
    // 确保数据安全，过滤掉无效数据
    publicationData.value = (data || []).filter(item => item && item.id);
  } catch (error) {
    console.error('加载发布数据失败:', error);
    $message.error('加载数据失败');
    publicationData.value = []; // 确保在错误时设置为空数组
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    title: '',
    content: '',
    cover: '',
    tags: [], // 重置为空数组
    link_url: '', // 重置链接字段
    author: '', // 重置作者字段
    booktitle: '', // 重置书籍标题
    code_url: '', // 重置代码链接
    bib: '', // 重置参考文献
    sort: 0, // 重置排序字段
    meeting: '', // 重置来源会议
    year: '', // 重置年份字段
    date: null
  });
  showModal.value = true;
}

function handleEdit(row: PublicationItem) {
  editMode.value = true;
  // 处理时间格式，将字符串时间转换为时间戳供NDatePicker使用
  let dateValue: number | null = null;
  if (row.date && isValidDate(row.date)) {
    dateValue = new Date(row.date).getTime();
  }
  
  // 将字符串标签转换为数组
  const tags = row.tag ? row.tag.split(',').filter(tag => tag.trim()).map(tag => tag.trim()) : [];
  
  Object.assign(formData, {
    ...row,
    tags, // 设置为数组
    link_url: row.link_url || '', // 设置链接字段
    author: row.author || '', // 设置作者字段
    booktitle: row.booktitle || '', // 设置书籍标题
    code_url: row.code_url || '', // 设置代码链接
    bib: row.bib || '', // 设置参考文献
    sort: (row as any).sort || 0, // 设置排序字段
    meeting: (row as any).meeting || '', // 设置来源会议
    year: (row as any).year || '', // 设置年份字段
    date: dateValue
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
    let dateValue = '';
    if (formData.date) {
      if (typeof formData.date === 'number') {
        // 如果是时间戳，转换为日期字符串
        dateValue = new Date(formData.date).toISOString().split('T')[0];
      } else if (typeof formData.date === 'string') {
        dateValue = formData.date;
      }
    } else {
      dateValue = new Date().toISOString().split('T')[0];
    }

    // 将标签数组转换为逗号分隔的字符串
    const tagString = formData.tags?.join(',') || '';

    const publicationInfo = {
      title: formData.title,
      content: formData.content,
      cover: formData.cover || '',
      tag: tagString, // 转换为字符串存储
      link_url: formData.link_url || '', // 添加链接字段
      author: formData.author || '', // 添加作者字段
      booktitle: formData.booktitle || '', // 添加书籍标题
      code_url: formData.code_url || '', // 添加代码链接
      bib: formData.bib || '', // 添加参考文献
      sort: formData.sort || 0, // 添加排序字段
      meeting: formData.meeting || '', // 添加来源会议
      year: formData.year || '', // 添加年份字段
      date: dateValue
    };

    if (editMode.value && formData.id) {
      // 更新发布
      await updatePublicationApi(formData.id, publicationInfo);
      $message.success('更新成功');
    } else {
      // 新增发布
      await createPublication(publicationInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存发布失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deletePublicationApi(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除发布失败:', error);
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
      selectedRowKeys.value.map(id => deletePublicationApi(id))
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
  deleteImage(formData.id , 'publications','cover')
  formData.cover = ""
}

// BibTeX Import Functions
async function handleBibTeXUpload({ file }: { file: UploadFileInfo }) {
  if (!file.file) return;
  
  // Check file extension
  if (!file.name?.toLowerCase().endsWith('.bib')) {
    $message.error('请选择 .bib 文件');
    return;
  }
  
  importLoading.value = true;
  importProgress.value = 0;
  importCurrent.value = 0;
  importTotal.value = 0;
  importCurrentItem.value = '';
  
  try {
    const result = await importBibTeXFromFile(
      file.file,
      (current, total, item) => {
        importCurrent.value = current;
        importTotal.value = total;
        importCurrentItem.value = item;
        importProgress.value = Math.round((current / total) * 100);
      },
      (error, entry) => {
        console.error('导入错误:', error, entry);
      }
    );
    
    importResult.value = result;
    showImportResult.value = true;
    
    if (result.success > 0) {
      $message.success(`成功导入 ${result.success} 条记录`);
      await loadData(); // 重新加载数据
    }
    
    if (result.errors.length > 0) {
      $message.warning(`${result.errors.length} 条记录导入失败`);
    }
    
  } catch (error) {
    console.error('BibTeX 导入失败:', error);
    $message.error('导入失败: ' + (error instanceof Error ? error.message : String(error)));
  } finally {
    importLoading.value = false;
    showImportModal.value = false;
  }
}

function handleImportCancel() {
  showImportModal.value = false;
  importLoading.value = false;
}

function openImportModal() {
  showImportModal.value = true;
  importResult.value = null;
  showImportResult.value = false;
}

function closeImportResult() {
  showImportResult.value = false;
  importResult.value = null;
}
</script>

<template>
  <div class="p-4">
    <NCard title="发布管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索标题、作者、内容、标签、链接、会议、年份等"
            clearable
            style="width: 300px"
          />
          <NButton @click="openImportModal">
            导入 BibTeX
          </NButton>
          <NButton 
            type="error" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </NButton>
          <NButton type="primary" @click="handleAdd">
            新增发布
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: PublicationItem) => row?.id || ''"
        :scroll-x="1720"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
      >
      </NDataTable>
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 1000px">
      <template #header>
        {{ editMode ? '编辑发布' : '新增发布' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="标题" path="title" required>
          <NInput 
            v-model:value="formData.title" 
            placeholder="请输入发布标题" 
            show-count
          />
        </NFormItem>
        
        <NFormItem label="封面图片" path="cover">
          <NSpace vertical style="width: 100%;">
            <CosUploader v-model="formData.cover"
                prefix="publish/cover/" 
                @imageDelete="imageDelete"  />
          </NSpace>
        </NFormItem>
        
        <NFormItem label="内容" path="content">
          <NInput
            v-model:value="formData.content"
            type="textarea"
            placeholder="请输入发布内容"
            :rows="6"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="标签" path="tags">
          <NCheckboxGroup v-model:value="formData.tags">
            <NSpace>
              <NCheckbox 
                v-for="option in tagOptions" 
                :key="option.value" 
                :value="option.value"
                :label="option.label"
              />
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>

        <NFormItem label="来源会议" path="meeting">
          <NSelect
            v-model:value="formData.meeting"
            :options="meetingOptions"
            placeholder="请选择或输入来源会议"
            filterable
            tag
            @update:value="handleMeetingChange"
            clearable
          />
        </NFormItem>
        
        <NFormItem label="书籍标题" path="booktitle">
          <NInput
            v-model:value="formData.booktitle"
            placeholder="请输入书籍标题"
            maxlength="500"
            show-count
          />
        </NFormItem>

       

        <NFormItem label="参考文献引用" path="bib">
          <NInput
            v-model:value="formData.bib"
            type="textarea"
            placeholder="请输入参考文献引用（支持BibTeX格式）"
            :rows="6"
            show-count
          />
        </NFormItem>


        <NFormItem label="代码链接" path="code_url">
          <NInput
            v-model:value="formData.code_url"
            placeholder="请输入代码链接"
            maxlength="500"
            show-count
          />
        </NFormItem>
        <NFormItem label="文章链接" path="link_url">
          <NInput
            v-model:value="formData.link_url"
            placeholder="请输入文章链接"
            maxlength="500"
            show-count
          />
        </NFormItem>

        <NFormItem label="作者" path="author">
          <NInput
            v-model:value="formData.author"
            placeholder="请输入作者"
            show-count
          />
        </NFormItem>

        <NFormItem label="排序" path="sort">
          <NInputNumber
            v-model:value="formData.sort"
            placeholder="请输入排序值"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="年份" path="year">
          <NInput
            v-model:value="formData.year"
            placeholder="请输入年份（如：2024）"
            maxlength="4"
            show-count
          />
        </NFormItem>

        <NFormItem label="发布日期" path="date">
          <NDatePicker
            v-model:value="formData.date"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="请选择发布日期"
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

    <!-- BibTeX 导入弹窗 -->
    <NModal v-model:show="showImportModal" preset="dialog" style="width: 600px">
      <template #header>
        导入 BibTeX 文件
      </template>
      
      <NSpace vertical>
        <NAlert type="info" title="导入说明">
          支持导入标准的 BibTeX (.bib) 格式文件。系统会自动解析论文信息并导入到发布管理中。
        </NAlert>
        
        <NUpload
          :disabled="importLoading"
          accept=".bib"
          :max="1"
          :show-file-list="false"
          @change="handleBibTeXUpload"
        >
          <NUploadDragger>
            <div style="margin-bottom: 12px">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18L12 12L17 18M7 6L12 12L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <NText style="font-size: 16px">
              点击或者拖动 BibTeX 文件到该区域来上传
            </NText>
            <NText depth="3" style="font-size: 12px">
              支持 .bib 格式文件
            </NText>
          </NUploadDragger>
        </NUpload>
        
        <div v-if="importLoading">
          <NSpace vertical>
            <NText>正在导入中...</NText>
            <NProgress 
              type="line" 
              :percentage="importProgress"
              :show-indicator="true"
            />
            <NText depth="3" style="font-size: 12px">
              {{ importCurrent }} / {{ importTotal }} - {{ importCurrentItem }}
            </NText>
          </NSpace>
        </div>
      </NSpace>
      
      <template #action>
        <NSpace>
          <NButton @click="handleImportCancel" :disabled="importLoading">
            取消
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 导入结果弹窗 -->
    <NModal v-model:show="showImportResult" preset="dialog" style="width: 500px">
      <template #header>
        导入结果
      </template>
      
      <NSpace vertical v-if="importResult">
        <NAlert 
          :type="importResult.success > 0 ? 'success' : 'warning'"
          :title="`成功导入 ${importResult.success} 条记录`"
        />
        
        <div v-if="importResult.errors.length > 0">
          <NText strong>导入失败的记录：</NText>
          <div style="max-height: 200px; overflow-y: auto; margin-top: 8px;">
            <div v-for="(error, index) in importResult.errors" :key="index" style="margin-bottom: 4px;">
              <NText depth="3" style="font-size: 12px">{{ error }}</NText>
            </div>
          </div>
        </div>
      </NSpace>
      
      <template #action>
        <NButton type="primary" @click="closeImportResult">
          确定
        </NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 16px;
}
</style> 