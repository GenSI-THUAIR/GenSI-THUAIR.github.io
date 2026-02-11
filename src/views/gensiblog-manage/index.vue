<script setup lang="ts">
import { ref, reactive, onMounted, computed, h, nextTick, shallowRef } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NTag, NDatePicker, NSelect, NTooltip, useMessage,
  NSwitch, NInputNumber, NPopconfirm
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

// TinyMCE 核心
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/icons/default';
// TinyMCE 插件（表格插件原生支持合并单元格）
import 'tinymce/plugins/table';
import 'tinymce/plugins/image';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/media';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/codesample';
// TinyMCE 皮肤（页面 UI）
import 'tinymce/skins/ui/oxide/skin.min.css';
// TinyMCE 编辑区内容 CSS（注入到编辑器 iframe）
// @ts-ignore Vite raw import
import contentCss from 'tinymce/skins/content/default/content.min.css?raw';
// @ts-ignore Vite raw import
import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css?raw';
import TinymceEditor from '@tinymce/tinymce-vue';

import katex from 'katex';
import 'katex/dist/katex.min.css';

// ====== 公式弹窗状态 ======
const showFormulaModal = ref(false);
const formulaInput = ref('');
const formulaDisplayMode = ref(false); // false=行内, true=块级
const activeFormulaEditor = shallowRef<any>(null);

import { 
  fetchGensiblogList, 
  createGensiblog, 
  updateGensiblog as updateGensiblogApi, 
  deleteGensiblog as deleteGensiblogApi,
  fetchBlogCommentsByBlogId,
  updateBlogComment as updateBlogCommentApi,
  deleteBlogComment as deleteBlogCommentApi
} from '@/service/api/gensiblog';
import { getAllBlogComments, uploadBlogImage } from '@/supabase/supabaseAction';

type GensiblogItem = Api.Gensiblog.GensiblogItem;

// 表单数据类型，publish_time字段支持NDatePicker的类型，tags在表单中为数组
type GensiblogFormData = Omit<Partial<GensiblogItem>, 'publish_time' | 'tags'> & {
  publish_time?: number | null;
  tags?: string[];
};

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<string[]>([]);


// 评论管理相关
const showCommentsModal = ref(false);
const commentsLoading = ref(false);
const currentBlogId = ref('');
const currentBlogTitle = ref('');
const commentsData = ref<Api.BlogComment.BlogCommentItem[]>([]);

// Tags 选项
const tagsOptions = [
  { label: 'attention', value: 'attention' },
  { label: 'transformers', value: 'transformers' },
  { label: 'generation', value: 'generation' },
  { label: 'multi-modality', value: 'multi-modality' },
  { label: 'NLP', value: 'NLP' },
  { label: 'language-models', value: 'language-models' },
  { label: 'diffusion-models', value: 'diffusion-models' }
];

const formData = reactive<GensiblogFormData>({
  title: '',
  subtitle: '',
  author: '',
  affiliations: '',
  publish_time: null,
  team: '',
  affiliations_des: '',
  citation: '',
  references: '',
  content: '',
  introducing: '',
  github_link: '',
  github_text: 'Code',
  huggingface_link: '',
  hug_text: 'HuggingFace',
  tags: [],
  readtime: '',
  paper_link: '',
  paper_text: 'Paper',
  page: '',
  page_text: 'Page',
  model: '',
  model_text: 'Model',
  introduction_label: 'Introduction',
  content_label: 'Content',
  reference_label: 'Reference',
  citation_label: 'Citation'
});

// flex_content 动态内容数组
interface FlexContentItem {
  labelname: string;
  content: string;
}
const flexContentList = ref<FlexContentItem[]>([]);

// 添加一个 flex_content 项
function addFlexContentItem() {
  flexContentList.value.push({ labelname: '', content: '' });
}

// 删除一个 flex_content 项
function removeFlexContentItem(index: number) {
  flexContentList.value.splice(index, 1);
}

// 可编辑 label 相关状态
const editingLabel = ref<string | null>(null); // 当前正在编辑的 label key
const editingLabelValue = ref(''); // 编辑中的临时值

function startEditLabel(key: string, currentValue: string) {
  editingLabel.value = key;
  editingLabelValue.value = currentValue;
  nextTick(() => {
    const input = document.querySelector('.label-edit-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
}

function confirmEditLabel(key: string) {
  if (editingLabelValue.value.trim()) {
    (formData as any)[key] = editingLabelValue.value.trim();
  }
  editingLabel.value = null;
  editingLabelValue.value = '';
}

function cancelEditLabel() {
  editingLabel.value = null;
  editingLabelValue.value = '';
}

const gensiblogData = ref<GensiblogItem[]>([]);

// TinyMCE 编辑器初始化配置（表格插件原生支持合并/拆分单元格）
const tinymceInit = {
  license_key: 'gpl',
  skin: false,
  content_css: false,
  content_style: `${contentCss}\n${contentUiCss}\nbody { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; padding: 12px 16px; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 8px 12px; }`,
  height: 350,
  menubar: 'file edit view insert format tools table',
  plugins: 'table image lists link code advlist autolink searchreplace fullscreen media wordcount codesample',
  toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify',
  toolbar2: 'bullist numlist | outdent indent | table image link media | insertFormula codesample code | searchreplace fullscreen',
  table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecellprops tablemergecells tablesplitcells',
  placeholder: '请输入内容...',
  promotion: false,
  branding: false,
  table_advtab: true,
  table_cell_advtab: true,
  table_row_advtab: true,
  table_default_styles: {
    'border-collapse': 'collapse',
    'width': '100%'
  },
  images_upload_handler: async (blobInfo: any) => {
    const msgReactive = $message.loading('正在上传图片...', { duration: 0 });
    try {
      const file = blobInfo.blob();
      const url = await uploadBlogImage(file);
      msgReactive.destroy();
      $message.success('图片上传成功');
      return url;
    } catch (error: any) {
      msgReactive.destroy();
      console.error('图片上传失败:', error);
      $message.error(`图片上传失败: ${error.message || '请重试'}`);
      throw error;
    }
  },
  setup: (editor: any) => {
    // 注册自定义"插入公式"工具栏按钮
    editor.ui.registry.addButton('insertFormula', {
      text: 'ƒ(x)',
      tooltip: '插入 LaTeX 公式',
      onAction: () => {
        activeFormulaEditor.value = editor;
        formulaInput.value = '';
        formulaDisplayMode.value = false;
        showFormulaModal.value = true;
      }
    });
  }
};

// 评论表格列定义
const commentsColumns: DataTableColumns<Api.BlogComment.BlogCommentItem> = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    render(_row: Api.BlogComment.BlogCommentItem, rowIndex: number) {
      return rowIndex + 1;
    }
  },
  {
    title: '评论内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '提交时间',
    key: 'created_at',
    width: 150,
    render(row) {
      return formatCommentTime(row.created_at);
    }
  },
  {
    title: '排序',
    key: 'sort',
    width: 120,
    render(row) {
      return h(NInputNumber, {
        value: row.sort || 0,
        min: 0,
        max: 9999,
        size: 'small',
        style: { width: '100px' },
        onUpdateValue: (val: number | null) => {
          if (val !== null) {
            handleUpdateCommentSort(row, val);
          }
        }
      });
    }
  },
  {
    title: '展示状态',
    key: 'state',
    width: 100,
    render(row) {
      return h(NSwitch, {
        value: row.state === 1,
        checkedValue: true,
        uncheckedValue: false,
        onUpdateValue: (val: boolean) => handleUpdateCommentState(row, val)
      }, {
        checked: () => '展示',
        unchecked: () => '隐藏'
      });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDeleteComment(row.id)
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error'
        }, { default: () => '删除' }),
        default: () => '确定要删除这条评论吗？'
      });
    }
  }
];

const columns: DataTableColumns<GensiblogItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    },
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
    title: '副标题',
    key: 'subtitle',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.subtitle || '-';
    }
  },
  {
    title: '作者',
    key: 'author',
    width: 150,
    render(row) {
      if (!row || !row.author) return '-';
      return h(NTag, {
        type: 'info',
        size: 'small'
      }, { default: () => row.author });
    }
  },
  {
    title: '所属单位',
    key: 'affiliations',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.affiliations || '-';
    }
  },
  {
    title: '团队',
    key: 'team',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      return row?.team || '-';
    }
  },
  {
    title: '发布时间',
    key: 'publish_time',
    width: 120,
    render(row) {
      return row?.publish_time || '-';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render(row) {
      if (!row || !row.id) return '-';
      return h(NSpace, null, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            onClick: () => handleViewComments(row)
          }, { default: () => '查看评论' }),
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
  let data = gensiblogData.value;
  
  // 如果有搜索条件，先进行过滤
  if (searchValue.value) {
    data = data.filter(item => 
      item && // 确保 item 不为 null
      (item.title?.includes(searchValue.value) || 
       item.subtitle?.includes(searchValue.value) ||
       item.author?.includes(searchValue.value) ||
       item.affiliations?.includes(searchValue.value) ||
       item.team?.includes(searchValue.value) ||
       item.content?.includes(searchValue.value) ||
       item.introducing?.includes(searchValue.value))
    );
  }
  
  // 按发布时间降序排序，最新的在最上面
  return data.sort((a, b) => {
    if (!a?.publish_time && !b?.publish_time) return 0;
    if (!a?.publish_time) return 1;
    if (!b?.publish_time) return -1;
    return new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime();
  });
});

// 公式实时预览（KaTeX 渲染）
const formulaPreviewHtml = computed(() => {
  const input = formulaInput.value.trim();
  if (!input) return '';
  try {
    return katex.renderToString(input, {
      displayMode: formulaDisplayMode.value,
      throwOnError: false
    });
  } catch {
    return '<span style="color:#e53e3e;">公式语法有误，请检查输入</span>';
  }
});

// 确认插入公式：以 <code>$...$</code> 形式写入编辑器
// 编辑器中显示为行内代码样式，前台展示页 processKatexInHtml 负责渲染为数学公式
function confirmInsertFormula() {
  const input = formulaInput.value.trim();
  if (!input || !activeFormulaEditor.value) return;

  const editor = activeFormulaEditor.value;
  const delimiter = formulaDisplayMode.value ? '$$' : '$';

  // HTML 转义公式中的特殊字符，防止被解析为 HTML
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // 用 <code> 包裹，编辑器中以代码样式展示，便于区分普通文本和公式
  const html = `<code>${delimiter}${escaped}${delimiter}</code>`;

  // 先关闭弹窗，释放焦点占用
  showFormulaModal.value = false;
  formulaInput.value = '';

  // 等弹窗 DOM 关闭后再操作编辑器
  nextTick(() => {
    editor.focus();
    editor.insertContent(html);
    activeFormulaEditor.value = null;
    $message.success('公式已插入，发布后将显示为渲染效果');
  });
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await fetchGensiblogList();
    // 确保数据安全，过滤掉无效数据
    gensiblogData.value = (data || []).filter(item => item && item.id);
  } catch (error) {
    console.error('加载Gensiblog数据失败:', error);
    $message.error('加载数据失败');
    gensiblogData.value = []; // 确保在错误时设置为空数组
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    title: '',
    subtitle: '',
    author: '',
    affiliations: '',
    publish_time: null,
    team: '',
    affiliations_des: '',
    citation: '',
    references: '',
    content: '',
    introducing: '',
    github_link: '',
    github_text: 'Code',
    huggingface_link: '',
    hug_text: 'HuggingFace',
    tags: [],
    readtime: '',
    paper_link: '',
    paper_text: 'Paper',
    page: '',
    page_text: 'Page',
    model: '',
    model_text: 'Model',
    introduction_label: 'Introduction',
    content_label: 'Content',
    reference_label: 'Reference',
    citation_label: 'Citation'
  });
  flexContentList.value = [];
  editingLabel.value = null;
  showModal.value = true;
}

function handleEdit(row: GensiblogItem) {
  editMode.value = true;
  // 处理时间格式，将字符串时间转换为时间戳供NDatePicker使用
  let timeValue: number | null = null;
  if (row.publish_time && isValidDate(row.publish_time)) {
    // 使用本地时间创建Date对象，避免时区偏移
    const [year, month, day] = row.publish_time.split('-').map(Number);
    timeValue = new Date(year, month - 1, day).getTime();
  }
  
  // 处理 tags，将逗号分隔的字符串转换为数组
  let tagsArray: string[] = [];
  if (row.tags && row.tags.trim() !== '') {
    tagsArray = row.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  
  Object.assign(formData, {
    ...row,
    publish_time: timeValue,
    tags: tagsArray,
    // 显示文字字段，如果为空则使用默认值
    github_text: row.github_text || 'Code',
    hug_text: row.hug_text || 'HuggingFace',
    paper_text: row.paper_text || 'Paper',
    page_text: row.page_text || 'Page',
    model_text: row.model_text || 'Model',
    // Label 字段，如果为空则使用默认值
    introduction_label: row.introduction_label || 'Introduction',
    content_label: row.content_label || 'Content',
    reference_label: row.reference_label || 'Reference',
    citation_label: row.citation_label || 'Citation'
  });

  // 解析 flex_content JSON 回填到数组
  if ((row as any).flex_content) {
    try {
      const parsed = JSON.parse((row as any).flex_content);
      flexContentList.value = Array.isArray(parsed) ? parsed : [];
    } catch {
      flexContentList.value = [];
    }
  } else {
    flexContentList.value = [];
  }

  editingLabel.value = null;
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
    if (formData.publish_time) {
      if (typeof formData.publish_time === 'number') {
        // 如果是时间戳，转换为本地日期字符串，避免时区问题
        const date = new Date(formData.publish_time);
        timeValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (typeof formData.publish_time === 'string') {
        timeValue = formData.publish_time;
      }
    } else {
      // 使用本地时间而不是UTC时间
      const now = new Date();
      timeValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // 处理 tags，将数组转换为逗号分隔的字符串
    const tagsString = Array.isArray(formData.tags) ? formData.tags.join(',') : '';
    
    // 将 flexContentList 转为 JSON 字符串
    const flexContentJson = flexContentList.value.length > 0
      ? JSON.stringify(flexContentList.value.filter(item => item.labelname || item.content))
      : '';

    const gensiblogInfo = {
      title: formData.title || '',
      subtitle: formData.subtitle || '',
      author: formData.author || '',
      affiliations: formData.affiliations || '',
      publish_time: timeValue,
      team: formData.team || '',
      affiliations_des: formData.affiliations_des || '',
      citation: formData.citation || '',
      references: formData.references || '',
      content: formData.content || '',
      introducing: formData.introducing || '',
      github_link: formData.github_link || '',
      github_text: formData.github_text || '',
      huggingface_link: formData.huggingface_link || '',
      hug_text: formData.hug_text || '',
      tags: tagsString,
      readtime: formData.readtime || '',
      paper_link: formData.paper_link || '',
      paper_text: formData.paper_text || '',
      page: formData.page || '',
      page_text: formData.page_text || '',
      model: formData.model || '',
      model_text: formData.model_text || '',
      introduction_label: formData.introduction_label || 'Introduction',
      content_label: formData.content_label || 'Content',
      reference_label: formData.reference_label || 'Reference',
      citation_label: formData.citation_label || 'Citation',
      flex_content: flexContentJson
    };

    if (editMode.value && formData.id) {
      // 更新
      await updateGensiblogApi(formData.id, gensiblogInfo);
      $message.success('更新成功');
    } else {
      // 新增
      await createGensiblog(gensiblogInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存Gensiblog失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteGensiblogApi(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除Gensiblog失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    $message.warning('请选择要删除的记录');
    return;
  }

  loading.value = true;
  try {
    // 并行删除所有选中的记录
    await Promise.all(
      selectedRowKeys.value.map(id => deleteGensiblogApi(id))
    );
    $message.success(`成功删除 ${selectedRowKeys.value.length} 条记录`);
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

// ========== 评论管理相关函数 ==========

// 查看评论
async function handleViewComments(row: GensiblogItem) {
  currentBlogId.value = row.id;
  currentBlogTitle.value = row.title || '未命名博客';
  showCommentsModal.value = true;
  await loadComments(row.id);
}

// 加载评论列表（所有评论，不限制状态）
async function loadComments(blogId: string) {
  commentsLoading.value = true;
  try {
    const allComments = await getAllBlogComments(blogId);
    // 过滤当前博客的评论，并按 sort 降序排列
      commentsData.value = (allComments || [])
      
    console.log('commentsData', commentsData.value);
  } catch (error) {
    console.error('加载评论失败:', error);
    $message.error('加载评论失败');
    commentsData.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

// 更新评论状态
async function handleUpdateCommentState(comment: Api.BlogComment.BlogCommentItem, newState: boolean) {
  try {
    await updateBlogCommentApi(String(comment.id), { state: newState ? 1 : 0 });
    $message.success(newState ? '评论已设为展示' : '评论已设为不展示');
    await loadComments(currentBlogId.value);
  } catch (error) {
    console.error('更新评论状态失败:', error);
    $message.error('更新状态失败');
  }
}

// 更新评论排序
async function handleUpdateCommentSort(comment: Api.BlogComment.BlogCommentItem, newSort: number) {
  try {
    await updateBlogCommentApi(String(comment.id), { sort: newSort });
    $message.success('排序更新成功');
    await loadComments(currentBlogId.value);
  } catch (error) {
    console.error('更新评论排序失败:', error);
    $message.error('更新排序失败');
  }
}

// 删除评论
async function handleDeleteComment(id: number) {
  try {
    await deleteBlogCommentApi(String(id));
    $message.success('评论已删除');
    await loadComments(currentBlogId.value);
  } catch (error) {
    console.error('删除评论失败:', error);
    $message.error('删除评论失败');
  }
}

// 格式化评论时间
function formatCommentTime(dateString: string) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(() => {
  loadData();
});

</script>

<template>
  <div class="p-4">
    <NCard :title="$t('route.gensiblog-manage')" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索标题、作者、机构或团队"
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
            新增记录
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: GensiblogItem) => row?.id || ''"
        :scroll-x="1600"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
      >
      </NDataTable>
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 1500px; max-height: 90vh;">
      <template #header>
        {{ editMode ? '编辑记录' : '新增记录' }}
      </template>
      
      <div class="form-container">
        <NForm
          :model="formData"
          label-placement="left"
          label-width="148px"
          require-mark-placement="right-hanging"
        >
          <!-- 基本信息区域 - 两列布局 -->
          <div class="form-grid">
            <NFormItem label="标题" path="title">
              <NInput 
                v-model:value="formData.title" 
                placeholder="请输入标题" 
                maxlength="200"
                show-count
              />
            </NFormItem>
            
            <NFormItem label="副标题" path="subtitle">
              <NInput 
                v-model:value="formData.subtitle" 
                placeholder="请输入副标题" 
                maxlength="200"
                show-count
              />
            </NFormItem>
            
            <NFormItem label="作者" path="author">
              <NInput
                v-model:value="formData.author"
                placeholder="请输入作者"
                maxlength="100"
              />
            </NFormItem>
            
            <NFormItem label="团队" path="team">
              <NInput
                v-model:value="formData.team"
                placeholder="请输入团队"
                maxlength="100"
              />
            </NFormItem>
            
            <NFormItem label="所属单位" path="affiliations">
              <NInput
                v-model:value="formData.affiliations"
                placeholder="请输入所属单位"
                maxlength="200"
              />
            </NFormItem>
            
            <NFormItem label="发布时间" path="publish_time">
              <NDatePicker
                v-model:value="formData.publish_time"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="请选择发布时间"
                style="width: 100%"
                clearable
              />
            </NFormItem>
          </div>
          
          <!-- 单列字段 -->
          <NFormItem label="Tags" path="tags">
            <NSelect
              v-model:value="formData.tags"
              :options="tagsOptions"
              placeholder="请选择标签"
              multiple
              clearable
              filterable
            />
          </NFormItem>
          
          <NFormItem label="所属单位描述" path="affiliations_des">
            <NInput
              v-model:value="formData.affiliations_des"
              placeholder="请输入所属单位描述"
              maxlength="200"
            />
          </NFormItem>
          
         
          
          <!-- 链接区域 - 两列布局 -->
          <div class="form-grid">
            

            <NFormItem label="Page链接" path="page">
              <NInput
                v-model:value="formData.page"
                placeholder="请输入Page链接"
                maxlength="500"
              />
            </NFormItem>
            
            <NFormItem label="Page文字" path="page_text">
              <NInput
                v-model:value="formData.page_text"
                placeholder="请输入Page文字"
                maxlength="200"
              />
            </NFormItem>

            <NFormItem label="Paper链接" path="paper_link">
              <NInput
                v-model:value="formData.paper_link"
                placeholder="请输入Paper链接"
                maxlength="500"
              />
            </NFormItem>

            <NFormItem label="Paper文字" path="paper_text">
              <NInput
                v-model:value="formData.paper_text"
                placeholder="请输入Paper文字"
                maxlength="200"
              />
            </NFormItem>
            <NFormItem label="GitHub链接" path="github_link">
              <NInput
                v-model:value="formData.github_link"
                placeholder="https://github.com/..."
                maxlength="500"
              />
            </NFormItem>
            
            <NFormItem label="GitHub文字" path="github_text">
              <NInput
                v-model:value="formData.github_text"
                placeholder="请输入GitHub文字"
                maxlength="200"
              />
            </NFormItem>

           

            <NFormItem label="Model链接" path="model">
              <NInput
                v-model:value="formData.model"
                placeholder="请输入Model链接"
                maxlength="500"
              />
            </NFormItem>
            
            <NFormItem label="Model文字" path="model_text">
              <NInput
                v-model:value="formData.model_text"
                placeholder="请输入Model文字"
                maxlength="200"
              />
            </NFormItem>
            <NFormItem label="Hugging Face链接" path="huggingface_link">
              <NInput
                v-model:value="formData.huggingface_link"
                placeholder="https://huggingface.co/..."
                maxlength="500"
              />
            </NFormItem>
            
            <NFormItem label="HuggingFace文字" path="hug_text" >
              <NInput
                v-model:value="formData.hug_text"
                placeholder="请输入HuggingFace文字"
                maxlength="200"
              />
            </NFormItem>

            <NFormItem label="阅读时间" path="readtime">
              <template #label>
                <span style="display: inline-flex; align-items: center; gap: 4px;">
                  阅读时间
                  <NTooltip trigger="hover">
                    <template #trigger>
                      <svg style="width: 14px; height: 14px; cursor: help; color: #999;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke-width="2"/>
                        <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </template>
                    只需填写数字（如：10），前端会自动添加 "min" 单位为 "10 min"
                  </NTooltip>
                </span>
              </template>
              <NInput
                v-model:value="formData.readtime"
                placeholder="只填数字，例如：10"
                maxlength="50"
              />
            </NFormItem>
          </div>
          
        

          <NFormItem path="Introduction">
            <template #label>
              <div v-if="editingLabel === 'introduction_label'" class="label-edit-wrapper">
                <input
                  class="label-edit-input"
                  v-model="editingLabelValue"
                  @blur="confirmEditLabel('introduction_label')"
                  @keyup.enter="confirmEditLabel('introduction_label')"
                  @keyup.escape="cancelEditLabel"
                   style="width: 100px;"
                />
              </div>
              <span v-else class="editable-label" @dblclick="startEditLabel('introduction_label', formData.introduction_label || 'Introduction')">
                {{ formData.introduction_label || 'Introduction' }}
                <NTooltip trigger="hover" style="max-width: 300px;">
                  <template #trigger>
                    <svg style="width: 14px; height: 14px; cursor: help; color: #999;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </template>
                  双击标题编辑自定义标签
                </NTooltip>
              </span>
            </template>
            <div class="editor-container">
              <TinymceEditor
                :model-value="formData.introducing || ''"
                :init="tinymceInit"
                license-key="gpl"
                @update:model-value="(val: string) => { formData.introducing = val; }"
              />
            </div>
          </NFormItem>
          
          <NFormItem path="content">
            <template #label>
              <div v-if="editingLabel === 'content_label'" class="label-edit-wrapper">
                <input
                  class="label-edit-input"
                  v-model="editingLabelValue"
                  @blur="confirmEditLabel('content_label')"
                  @keyup.enter="confirmEditLabel('content_label')"
                  @keyup.escape="cancelEditLabel"
                   style="width: 100px;"
                  
                />
              </div>
              <span v-else class="editable-label" @dblclick="startEditLabel('content_label', formData.content_label || 'Content')" style="display: inline-flex; align-items: center; gap: 4px;">
                {{ formData.content_label || 'Content' }}
                <NTooltip trigger="hover" style="max-width: 300px;">
                  <template #trigger>
                    <svg style="width: 14px; height: 14px; cursor: help; color: #999;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </template>
                  使用编辑器工具栏中的标题功能（H1、H2、H3）添加章节标题，这些标题会自动生成左侧的目录导航（CONTENTS）双击标题编辑自定义标签
                </NTooltip>
              </span>
            </template>
            <div class="editor-container">
              <TinymceEditor
                :model-value="formData.content || ''"
                :init="tinymceInit"
                license-key="gpl"
                @update:model-value="(val: string) => { formData.content = val; }"
              />
            </div>
          </NFormItem>

          <!-- flex_content 动态内容区域 -->
          <div class="flex-content-add-bar">
            <NButton type="primary" size="small" dashed @click="addFlexContentItem">
              + 添加扩展内容块
            </NButton>
          </div>

          <NFormItem v-for="(item, index) in flexContentList" :key="index" :path="'flex_content_' + index">
            <template #label>
              <span class="editable-label" style="display: inline-flex; align-items: center; gap: 4px;">
                <NInput
                  v-model:value="item.labelname"
                  placeholder="标签名称"
                  size="small"
                  style="width: 120px;"
                />
                <NButton type="error" size="tiny" quaternary @click="removeFlexContentItem(index)">
                  <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </NButton>
              </span>
            </template>
            <div class="editor-container">
              <TinymceEditor
                :model-value="item.content || ''"
                :init="tinymceInit"
                license-key="gpl"
                @update:model-value="(val: string) => { item.content = val; }"
              />
            </div>
          </NFormItem>

            <!-- 富文本编辑器区域 -->
            <NFormItem path="references">
            <template #label>
              <div v-if="editingLabel === 'reference_label'" class="label-edit-wrapper">
                <input
                  class="label-edit-input"
                  v-model="editingLabelValue"
                  @blur="confirmEditLabel('reference_label')"
                  @keyup.enter="confirmEditLabel('reference_label')"
                  @keyup.escape="cancelEditLabel"
                   style="width: 100px;"
                />
              </div>
              <span v-else class="editable-label" @dblclick="startEditLabel('reference_label', formData.reference_label || 'Reference')">
                {{ formData.reference_label || 'Reference' }}
                <NTooltip trigger="hover" style="max-width: 300px;">
                  <template #trigger>
                    <svg style="width: 14px; height: 14px; cursor: help; color: #999;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </template>
                  双击标题编辑自定义标签
                </NTooltip>
              </span>
            </template>
            <div class="editor-container">
              <TinymceEditor
                :model-value="formData.references || ''"
                :init="{ ...tinymceInit, height: 300 }"
                license-key="gpl"
                @update:model-value="(val: string) => { formData.references = val; }"
              />
            </div>
          </NFormItem>   
          <NFormItem path="citation">
            <template #label>
              <div v-if="editingLabel === 'citation_label'" class="label-edit-wrapper">
                <input
                  class="label-edit-input"
                  v-model="editingLabelValue"
                  @blur="confirmEditLabel('citation_label')"
                  @keyup.enter="confirmEditLabel('citation_label')"
                  @keyup.escape="cancelEditLabel"
                  style="width: 100px;"
                />
              </div>
              <span v-else class="editable-label" @dblclick="startEditLabel('citation_label', formData.citation_label || 'Citation')">
                {{ formData.citation_label || 'Citation' }}
                <NTooltip trigger="hover" style="max-width: 300px;">
                  <template #trigger>
                    <svg style="width: 14px; height: 14px; cursor: help; color: #999;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-width="2"/>
                      <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </template>
                  双击标题编辑自定义标签
                </NTooltip>
              </span>
            </template>
            <NInput
              v-model:value="formData.citation"
              type="textarea"
              placeholder="请输入引用信息"
              :rows="3"
              maxlength="2000"
              show-count
            />
          </NFormItem>
        </NForm>
      </div>
      <template #action>
        <NSpace>
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="handleSave" :loading="loading">
            {{ editMode ? '更新' : '创建' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 评论管理弹窗 -->
    <NModal 
      v-model:show="showCommentsModal" 
      preset="card" 
      style="width: 900px; max-height: 80vh;"
      :title="`评论管理 - ${currentBlogTitle}`"
    >
      <div class="comments-container">
        <div class="comments-tip">
          <NTag type="info" size="small">提示</NTag>
          <span>Sort值越大排序越靠前，最多展示10条状态为"展示"的评论</span>
        </div>
        
        <NDataTable
          :loading="commentsLoading"
          :columns="commentsColumns"
          :data="commentsData"
          :pagination="{ pageSize: 10 }"
          :row-key="(row: Api.BlogComment.BlogCommentItem) => row?.id || 0"
          :scroll-x="800"
          max-height="400"
        />
        
        <div v-if="commentsData.length === 0 && !commentsLoading" class="comments-empty">
          <span>暂无评论</span>
        </div>
      </div>
      
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showCommentsModal = false">关闭</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 公式输入弹窗 -->
    <NModal v-model:show="showFormulaModal" preset="dialog" title="插入 LaTeX 公式" style="width: 560px;" :show-icon="false">
      <div class="formula-dialog">
        <div class="formula-mode-row">
          <span class="formula-mode-label">公式类型：</span>
          <NSpace>
            <NButton size="small" :type="!formulaDisplayMode ? 'primary' : 'default'" @click="formulaDisplayMode = false">
              行内公式 <code>$...$</code>
            </NButton>
            <NButton size="small" :type="formulaDisplayMode ? 'primary' : 'default'" @click="formulaDisplayMode = true">
              块级公式 <code>$$...$$</code>
            </NButton>
          </NSpace>
        </div>
        <NInput
          v-model:value="formulaInput"
          type="textarea"
          :rows="3"
          placeholder="输入 LaTeX 公式，如：E=mc^2、\sum_{i=1}^{n} x_i、\frac{a}{b}"
          style="margin-top: 12px; font-family: 'Courier New', monospace;"
        />
        <div v-if="formulaInput.trim()" class="formula-preview-box">
          <div class="formula-preview-label">预览效果：</div>
          <div class="formula-preview-content" v-html="formulaPreviewHtml"></div>
        </div>
      </div>
      <template #action>
        <NSpace>
          <NButton @click="showFormulaModal = false">取消</NButton>
          <NButton type="primary" :disabled="!formulaInput.trim()" @click="confirmInsertFormula">插入公式</NButton>
        </NSpace>
      </template>
    </NModal>

  </div>
</template>

<style scoped>
.p-4 {
  padding: 16px;
}

.form-container {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}

.editor-container {
  width: 100%;
  border: 1px solid #e0e0e6;
  border-radius: 6px;
  overflow: hidden;
}

/* TinyMCE 编辑器容器样式 */
:deep(.tox-tinymce) {
  border: none !important;
  border-radius: 0 !important;
}

:deep(.tox .tox-toolbar__primary) {
  background-color: #fafafa !important;
}

/* TinyMCE 弹出层 z-index 确保在 NModal 之上 */
:deep(.tox-tinymce-aux) {
  z-index: 9999 !important;
}

/* 优化滚动条样式 */
.form-container::-webkit-scrollbar {
  width: 6px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* flex_content 添加按钮栏 */
.flex-content-add-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

/* 评论管理样式 */
.comments-container {
  min-height: 200px;
}

.comments-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.comments-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

/* 可编辑 Label 样式 */
.editable-label {
  cursor: default;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.editable-label:hover {
  background-color: #f0f0f5;
}

.editable-label:hover .edit-hint {
  opacity: 1;
}

.edit-hint {
  font-size: 11px;
  color: #999;
  opacity: 0;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  font-weight: normal;
}

.label-edit-wrapper {
  display: inline-flex;
  align-items: center;
}

.label-edit-input {
  font-size: 14px;
  font-weight: 500;
  padding: 2px 6px;
  border: 1px solid #36ad6a;
  border-radius: 4px;
  outline: none;
  background: #fff;
  color: #333;
  width: 150px;
  box-shadow: 0 0 0 2px rgba(54, 173, 106, 0.2);
}

.label-edit-input:focus {
  border-color: #36ad6a;
}

/* 公式输入弹窗样式 */
.formula-dialog {
  padding: 4px 0;
}

.formula-mode-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.formula-mode-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.formula-mode-row code {
  font-size: 12px;
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 3px;
}

.formula-preview-box {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.formula-preview-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
}

.formula-preview-content {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
  padding: 4px 0;
}

.formula-preview-content :deep(.katex-display) {
  margin: 0;
}

.formula-preview-content :deep(.katex) {
  font-size: 1.2em;
}
</style>

<!-- TinyMCE 弹出层（对话框、菜单等）挂载到 body 上，需要全局样式确保 z-index 在 NModal 之上 -->
<style>
.tox-tinymce-aux {
  z-index: 10000 !important;
}
</style>

