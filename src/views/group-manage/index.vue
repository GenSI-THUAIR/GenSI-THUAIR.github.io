<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, useMessage 
} from 'naive-ui';
import FileUploader from '@/components/common/FileUploader.vue';
import type { DataTableColumns } from 'naive-ui';
import { 
  getGroupList, 
  insertGroup, 
  updateGroup, 
  deleteGroup 
} from '@/supabase/supabaseAction';

interface GroupItem {
  id: string;
  title: string;
  filepath: string;
  created_at?: string;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');

const formData = reactive<Partial<GroupItem>>({
  title: '',
  filepath: ''
});

const groupData = ref<GroupItem[]>([]);

const columns: DataTableColumns<GroupItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '推文标题',
    key: 'title',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '附件',
    key: 'filepath',
    width: 200,
    render(row) {
      if (!row.filepath) return '无附件';
      
      const fileName = row.filepath.split('/').pop() || '附件';
      return h('a', {
        href: row.filepath,
        target: '_blank',
        style: 'color: #18a058; text-decoration: none;'
      }, fileName);
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
  if (!searchValue.value) return groupData.value;
  return groupData.value.filter(item => 
    item.title.includes(searchValue.value)
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await getGroupList();
    groupData.value = data || [];
  } catch (error) {
    console.error('加载公众推文数据失败:', error);
    $message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  console.log('handleAdd called');
  console.log('showModal before:', showModal.value);
  editMode.value = false;
  Object.assign(formData, {
    title: '',
    filepath: ''
  });
  showModal.value = true;
  console.log('showModal after:', showModal.value);
}

function handleEdit(row: GroupItem) {
  editMode.value = true;
  Object.assign(formData, row);
  showModal.value = true;
}

async function handleSave() {
  if (!formData.title) {
    $message.error('请填写推文标题');
    return;
  }

  loading.value = true;
  try {
    const groupInfo = {
      title: formData.title,
      filepath: formData.filepath || ''
    };

    if (editMode.value && formData.id) {
      // 更新推文
      await updateGroup(formData.id, groupInfo);
      $message.success('更新成功');
    } else {
      // 新增推文
      await insertGroup(groupInfo);
      $message.success('新增成功');
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存公众推文失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteGroup(id);
    $message.success('删除成功');
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除公众推文失败:', error);
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
    <NCard title="公众推文管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索推文标题"
            clearable
            style="width: 200px"
          />
          <NButton type="primary" @click="handleAdd">
            新增推文
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: GroupItem) => row.id"
        :scroll-x="800"
      />
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal 
      v-model:show="showModal" 
      style="width: 600px;"
      :mask-closable="false"
      :closable="true"
      title="推文管理"
    >
             <NCard :title="editMode ? '编辑推文' : '新增推文'" size="small">
         <NForm
           :model="formData"
           label-placement="left"
           label-width="80px"
           require-mark-placement="right-hanging"
         >
           <NFormItem label="推文标题" path="title" required>
             <NInput v-model:value="formData.title" placeholder="请输入推文标题" />
           </NFormItem>
           
           <NFormItem label="附件文件" path="filepath">
             <div style="width: 100%;">
               <FileUploader 
                 v-model="formData.filepath"
                 :prefix="'group/'"
                 :max-files="1"
                 :multiple="false"
                 style="width: 100%;"
               />
               <div style="margin-top: 8px; font-size: 12px; color: #666;">
                 支持上传 PDF、Markdown 文件，只能上传一个文件
               </div>
             </div>
           </NFormItem>
         </NForm>
         
         <template #action>
           <NSpace>
             <NButton @click="showModal = false">取消</NButton>
             <NButton type="primary" @click="handleSave" :loading="loading">确定</NButton>
           </NSpace>
         </template>
       </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 16px;
}
</style> 