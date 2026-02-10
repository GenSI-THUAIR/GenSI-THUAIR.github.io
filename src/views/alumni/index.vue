<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NPopconfirm, NTag, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { 
  getAlumniList, 
  insertAlumni, 
  updateAlumni, 
  deleteAlumni 
} from '@/supabase/supabaseAction';

interface AlumniItem {
  id: string;
  name: string;
  name_cn?: string;
  describe: string;
  describe_cn?: string;
  created_at?: string;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');

const formData = reactive<Partial<AlumniItem>>({
  name: '',
  name_cn: '',
  describe: '',
  describe_cn: ''
});

const alumniData = ref<AlumniItem[]>([]);

const columns: DataTableColumns<AlumniItem> = [
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
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '中文姓名',
    key: 'name_cn',
    width: 120,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '简介',
    key: 'describe',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '中文简介',
    key: 'describe_cn',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render(row) {
      return row.created_at ? new Date(row.created_at).toLocaleString() : '';
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
            onClick: () => handleEdit(row)
          }, { default: () => '编辑' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            default: () => '确认删除这个校友信息吗？',
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
  if (!searchValue.value) return alumniData.value;
  return alumniData.value.filter(item => 
    item.name.includes(searchValue.value) ||
    (item.name_cn && item.name_cn.includes(searchValue.value)) ||
    item.describe.includes(searchValue.value) ||
    (item.describe_cn && item.describe_cn.includes(searchValue.value))
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getAlumniList();
    alumniData.value = data || [];
  } catch (error) {
    console.error('加载校友数据失败:', error);
    $message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  editMode.value = false;
  Object.assign(formData, {
    name: '',
    name_cn: '',
    describe: '',
    describe_cn: ''
  });
  showModal.value = true;
}

function handleEdit(row: AlumniItem) {
  editMode.value = true;
  Object.assign(formData, row);
  showModal.value = true;
}

async function handleDelete(id: string) {
  try {
    await deleteAlumni(id);
    $message.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除校友失败:', error);
    $message.error('删除失败');
  }
}

async function handleSubmit() {
  try {
    if (!formData.name || !formData.describe) {
      $message.error('请填写所有必填字段');
      return;
    }

    if (editMode.value) {
      await updateAlumni(formData.id!, {
        name: formData.name,
        name_cn: formData.name_cn,
        describe: formData.describe,
        describe_cn: formData.describe_cn
      });
      $message.success('更新成功');
    } else {
      await insertAlumni({
        name: formData.name,
        name_cn: formData.name_cn,
        describe: formData.describe,
        describe_cn: formData.describe_cn
      });
      $message.success('添加成功');
    }
    
    showModal.value = false;
    loadData();
  } catch (error) {
    console.error('操作失败:', error);
    $message.error('操作失败');
  }
}

function handleCancel() {
  showModal.value = false;
  Object.assign(formData, {
    name: '',
    name_cn: '',
    describe: '',
    describe_cn: ''
  });
}



onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="view-page">
    <NCard :bordered="false" class="h-full rounded-8px shadow-sm">
      <div class="flex-col h-full">
        <div class="flex-y-center justify-between pb-18px">
          <div class="flex-y-center gap-16px">
            <div class="text-20px font-bold">校友管理</div>
            <NTag type="info" class="text-12px">
              管理校友信息
            </NTag>
          </div>
          <NButton type="primary" @click="handleAdd">
            <template #icon>
              <svg-icon icon="mdi:plus" class="text-16px" />
            </template>
            添加校友
          </NButton>
        </div>
        
        <div class="flex-y-center pb-18px">
          <NInput 
            v-model:value="searchValue" 
            placeholder="搜索校友姓名或简介"
            clearable 
            class="w-300px"
          >
            <template #prefix>
              <svg-icon icon="mdi:magnify" class="text-16px" />
            </template>
          </NInput>
        </div>
        
        <div class="flex-1">
          <NDataTable
            :columns="columns"
            :data="filteredData"
            :loading="loading"
            :pagination="{ pageSize: 10 }"
            :bordered="false"
            class="h-full"
          />
        </div>
      </div>
    </NCard>

    <!-- 添加/编辑模态框 -->
    <NModal v-model:show="showModal" preset="card" :title="editMode ? '编辑校友' : '添加校友'" class="w-700px">
      <NForm :model="formData" label-placement="left" :label-width="100">
        <NFormItem label="英文姓名" path="name">
          <NInput v-model:value="formData.name" placeholder="请输入校友英文姓名" />
        </NFormItem>
        <NFormItem label="中文姓名" path="name_cn">
          <NInput v-model:value="formData.name_cn" placeholder="请输入校友中文姓名" />
        </NFormItem>
        <NFormItem label="英文简介" path="describe">
          <NInput
            v-model:value="formData.describe"
            type="textarea"
            placeholder="请输入校友英文简介"
            :autosize="{ minRows: 4, maxRows: 8 }"
          />
        </NFormItem>
        <NFormItem label="中文简介" path="describe_cn">
          <NInput
            v-model:value="formData.describe_cn"
            type="textarea"
            placeholder="请输入校友中文简介"
            :autosize="{ minRows: 4, maxRows: 8 }"
          />
        </NFormItem>
      </NForm>
      
      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleCancel">取消</NButton>
          <NButton type="primary" @click="handleSubmit">
            {{ editMode ? '更新' : '添加' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.view-page {
  height: 100%;
  padding: 20px;
}
</style>
