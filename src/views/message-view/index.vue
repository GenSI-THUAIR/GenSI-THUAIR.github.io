<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NPopconfirm, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { 
  getMessages, 
  deleteMessage 
} from '@/supabase/supabaseAction';

interface MessageItem {
  id: string;
  created_at?: string;
  first_name: string;
  last_name: string;
  email_address: string;
  message: string;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const searchValue = ref('');
const currentMessage = ref<MessageItem | null>(null);

const messageData = ref<MessageItem[]>([]);

const columns: DataTableColumns<MessageItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '姓名',
    key: 'name',
    width: 120,
    render(row) {
      return `${row.first_name} ${row.last_name}`;
    }
  },
  {
    title: '邮箱地址',
    key: 'email_address',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '留言内容',
    key: 'message',
    width: 300,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render(row) {
      return row.created_at ? new Date(row.created_at).toLocaleString() : '-';
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            onClick: () => handleView(row)
          }, { default: () => '查看详情' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            default: () => '确认删除这条留言吗？',
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '删除' })
          })
        ]
      });
    }
  }
];

const filteredData = computed(() => {
  if (!searchValue.value) return messageData.value;
  return messageData.value.filter(item => 
    item.first_name.includes(searchValue.value) || 
    item.last_name.includes(searchValue.value) ||
    item.email_address.includes(searchValue.value) ||
    item.message.includes(searchValue.value)
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getMessages();
    messageData.value = data || [];
  } catch (error) {
    console.error('加载留言数据失败:', error);
    $message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function handleView(row: MessageItem) {
  currentMessage.value = row;
  showModal.value = true;
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteMessage(id);
    await loadData(); // 重新加载数据
    $message.success('删除成功');
  } catch (error) {
    console.error('删除留言失败:', error);
    $message.error('删除失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="p-4">
    <NCard title="留言管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索姓名、邮箱或留言内容"
            clearable
            style="width: 300px"
          />
          <NButton @click="loadData" :loading="loading">刷新</NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: MessageItem) => row.id"
      />
    </NCard>

    <!-- 查看留言详情弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 600px">
      <template #header>
        留言详情
      </template>
      
      <div v-if="currentMessage" class="message-detail">
        <div class="message-info">
          <div class="info-row">
            <span class="label">ID：</span>
            <span>{{ currentMessage.id }}</span>
          </div>
          <div class="info-row">
            <span class="label">姓名：</span>
            <span>{{ currentMessage.first_name }} {{ currentMessage.last_name }}</span>
          </div>
          <div class="info-row">
            <span class="label">邮箱地址：</span>
            <span>{{ currentMessage.email_address }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间：</span>
            <span>{{ currentMessage.created_at ? new Date(currentMessage.created_at).toLocaleString() : '-' }}</span>
          </div>
        </div>
        
        <div class="content-section">
          <div class="section-title">留言内容：</div>
          <div class="content-box">{{ currentMessage.message }}</div>
        </div>
      </div>
      
      <template #action>
        <NButton @click="showModal = false">关闭</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 16px;
}

.message-detail {
  padding: 16px 0;
}

.message-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.label {
  font-weight: 500;
  width: 100px;
  color: #666;
}

.content-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
}

.content-box {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  min-height: 80px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style> 