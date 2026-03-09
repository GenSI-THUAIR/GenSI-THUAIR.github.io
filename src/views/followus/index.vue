<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NTag, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { 
  fetchFollowUsList, 
  createFollowUs, 
  updateFollowUs as updateFollowUsApi, 
  deleteFollowUs as deleteFollowUsApi 
} from '@/service/api/followus';

type FollowUsItem = Api.FollowUs.FollowUsItem;

// 表单数据类型，只保留content、content_cn、time、link四个字段
type FollowUsFormData = {
  id?: string;
  content?: string;
  content_cn?: string;
  time?: string;
  link?: string;
};

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');
const selectedRowKeys = ref<string[]>([]);

const formData = reactive<FollowUsFormData>({
  content: '',
  content_cn: '',
  time: '',
  link: ''
});

const followUsData = ref<FollowUsItem[]>([]);

const columns: DataTableColumns<FollowUsItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '平台',
    key: 'platform',
    width: 100,
    render(row, index) {
      if (!row) return '-';
      // 根据排序后的索引显示平台标识
      if (index === 0) {
        return h(NTag, { type: 'success' }, { default: () => '微信' });
      } else if (index === 1) {
        return h(NTag, { type: 'error' }, { default: () => '小红书' });
      }
      return h(NTag, { type: 'default' }, { default: () => '其他' });
    }
  },
  {
    title: '内容',
    key: 'content',
    width: 300,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      // 截取内容前100个字符显示
      const content = row.content || '';
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
  },
  {
    title: '时间',
    key: 'time',
    width: 150,
    render(row) {
      return row?.time || '-';
    }
  },
  {
    title: '链接',
    key: 'link',
    width: 250,
    ellipsis: {
      tooltip: true
    },
    render(row) {
      if (!row) return '-';
      return row.link ? h('a', {
        href: row.link,
        target: '_blank',
        style: 'color: #18a058; text-decoration: none;'
      }, row.link) : '-';
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
         // h(NButton, {
         //   size: 'small',
         //   type: 'error',
         //   onClick: () => handleDelete(row.id)
         // }, { default: () => '删除' })
        ]
      });
    }
  }
];

const filteredData = computed(() => {
  let data = followUsData.value;
  
  // 先按创建时间排序（最新的在前）
  data = [...data].sort((a, b) => {
    if (!a?.created_at || !b?.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // 再进行搜索过滤
  if (!searchValue.value) return data;
  return data.filter(item => 
    item && // 确保 item 不为 null
    (item.content?.includes(searchValue.value) ||
     item.time?.includes(searchValue.value) ||
     item.link?.includes(searchValue.value))
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await fetchFollowUsList();
    // 确保数据安全，过滤掉无效数据
    followUsData.value = (data || []).filter(item => item && item.id);
  } catch (error) {
    console.error('加载关注我们数据失败:', error);
    $message.error('加载数据失败');
    followUsData.value = []; // 确保在错误时设置为空数组
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    content: '',
    content_cn: '',
    time: '',
    link: ''
  });
  showModal.value = true;
}

function handleEdit(row: FollowUsItem) {
  editMode.value = true;
  Object.assign(formData, {
    id: row.id,
    content: row.content || '',
    content_cn: row.content_cn || '',
    time: row.time || '',
    link: row.link || ''
  });
  showModal.value = true;
}

async function handleSave() {
  if (!formData.content) {
    $message.error('请填写内容');
    return;
  }

  loading.value = true;
  try {
    const followUsInfo = {
      content: formData.content,
      content_cn: formData.content_cn || '',
      time: formData.time || '',
      link: formData.link || ''
    };

    if (editMode.value && formData.id) {
      // 更新关注我们
      await updateFollowUsApi(formData.id, followUsInfo);
      $message.success('更新成功');
    } else {
      // 新增关注我们
      await createFollowUs(followUsInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存关注我们失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteFollowUsApi(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除关注我们失败:', error);
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
      selectedRowKeys.value.map(id => deleteFollowUsApi(id))
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
</script>

<template>
  <div class="p-4">
    <NCard title="关注我们管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索内容、时间或链接"
            clearable
            style="width: 250px"
          />
          <NButton 
            type="error" 
            :disabled="selectedRowKeys.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </NButton>
          <!-- 
          <NButton type="primary" @click="handleAdd">
            新增关注
          </NButton>
          -->
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: FollowUsItem) => row?.id || ''"
        :scroll-x="1000"
        :checked-row-keys="selectedRowKeys"
        @update:checked-row-keys="handleCheck"
      >
      </NDataTable>
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 600px">
      <template #header>
        {{ editMode ? '编辑关注我们' : '新增关注我们' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="80px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="英文内容" path="content">
          <NInput
            v-model:value="formData.content"
            type="textarea"
            placeholder="请输入内容"
            :rows="6"
            show-count
          />
        </NFormItem>
        
        <NFormItem label="中文内容" path="content_cn">
          <NSpace vertical style="width: 100%;">
          <NInput
            v-model:value="formData.content_cn"
            type="textarea"
            placeholder="请输入中文内容"
            :rows="6"
            show-count
          />
          <div style="font-size: 12px; color: #999;">
              中英文显示规则：中英文内容都输入，则中英文都显示，只输入英文，则只显示英文，只输入中文，则只显示中文
            </div>
            </NSpace>
        </NFormItem>
        
        <NFormItem label="时间" path="time">
          <NInput
            v-model:value="formData.time"
            placeholder="请输入时间，如：2024-01-01"
            maxlength="50"
          />
        </NFormItem>
        
        <NFormItem label="链接" path="link">
          <NInput
            v-model:value="formData.link"
            placeholder="请输入相关链接，如：https://example.com"
            maxlength="500"
          />
          <div style="font-size: 12px; color: #999;">
            
            </div>
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
</style> 