<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import { 
  NCard, NInput, NButton, NSpace, NDataTable, NModal, NForm, 
  NFormItem, NPopconfirm, NAvatar, NTag, NRadioGroup, NRadio, NInputNumber, useMessage 
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import CosUploader from '@/components/common/CosUploader.vue';
import  supabase  from '@/supabase/supabase';
import { 
  getMembers, 
  insertMember, 
  updateMember, 
  deleteMember ,
  deleteImage
} from '@/supabase/supabaseAction';

interface MemberItem {
  id: string;
  name: string;
  name_cn?: string;
  age: number;
  avatar?: string;
  ct_avatar?: string;
  description?: string;
  description_cn?: string;
  link_url?: string;
  role?: string;
  sort?: number;
  created_at?: string;
}

const $message = useMessage();
const loading = ref(false);
const showModal = ref(false);
const editMode = ref(false);
const searchValue = ref('');

const formData = reactive<Partial<MemberItem>>({
  name: '',
  name_cn: '',
  age: 0,
  avatar: '',
  ct_avatar: '',
  description: '',
  description_cn: '',
  link_url: '',
  role: 'staff',
  sort: 0
});

const memberData = ref<MemberItem[]>([]);

const columns: DataTableColumns<MemberItem> = [
  {
    title: 'ID',
    key: 'id',
    width: 60,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '头像',
    key: 'avatar',
    width: 70,
    render(row) {
      return h(NAvatar, {
        src: row.avatar,
        fallbackSrc: 'https://avatar.vercel.sh/default',
        size: 'small'
      });
    }
  },
  {
    title: '卡通头像',
    key: 'ct_avatar',
    width: 70,
    render(row) {
      return h(NAvatar, {
        src: row.ct_avatar,
        fallbackSrc: 'https://avatar.vercel.sh/cartoon',
        size: 'small'
      });
    }
  },
  {
    title: '姓名',
    key: 'name',
    width: 100
  },
  {
    title: '姓名(中文)',
    key: 'name_cn',
    width: 100
  },
  {
    title: '个人简介',
    key: 'description',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '个人简介(中文)',
    key: 'description_cn',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '个人中心链接',
    key: 'link_url',
    width: 120,
    render(row) {
      return row.link_url ? h(NButton, {
        size: 'small',
        text: true,
        type: 'primary',
        onClick: () => window.open(row.link_url, '_blank')
      }, { default: () => '访问' }) : '';
    }
  },
  {
    title: '排序',
    key: 'sort',
    width: 70,
    sorter: (a, b) => (a.sort || 0) - (b.sort || 0)
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 150,
    render(row) {
      return row.created_at ? new Date(row.created_at).toLocaleDateString() : '';
    }
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render(row) {
      if (!row.role) return '';
      const roleMap = {
        'Professor': 'Professor',
        'Staff': 'Staff',
        'Student': 'Student'
      };
      return h(NTag, {
        type: 'info'
      }, {
        default: () => roleMap[row.role as keyof typeof roleMap] || row.role
      });
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
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            default: () => '确认删除这个成员吗？',
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
  if (!searchValue.value) return memberData.value;
  return memberData.value.filter(item => 
    item.name.includes(searchValue.value) ||
    item.name_cn?.includes(searchValue.value) ||
    item.description?.includes(searchValue.value) ||
    item.description_cn?.includes(searchValue.value) ||
    item.age?.toString().includes(searchValue.value)
  );
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const data = await supabase.from('member').select('*').order('sort', { ascending: true });
    console.log(data)
    memberData.value = data.data || [];
  } catch (error) {
    console.error('加载成员数据失败:', error);
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
    age: 0,
    avatar: '',
    ct_avatar: '',
    description: '',
    description_cn: '',
    link_url: '',
    role: 'staff',
    sort: 0
  });
  showModal.value = true;
}

function handleEdit(row: MemberItem) {
  editMode.value = true;
  Object.assign(formData, row);
  showModal.value = true;
}

async function handleSave() {
  loading.value = true;
  try {
    const memberData = {
      name: formData.name,
      name_cn: formData.name_cn,
      age: formData.age,
      avatar: formData.avatar,
      ct_avatar: formData.ct_avatar,
      description: formData.description,
      description_cn: formData.description_cn,
      link_url: formData.link_url,
      role: formData.role,
      sort: formData.sort
    };

    if (editMode.value && formData.id) {
      // 更新成员
      await updateMember(formData.id, memberData);
    } else {
      // 新增成员
      await insertMember(memberData);
    }
    showModal.value = false;
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('保存成员失败:', error);
    $message.error('保存失败');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  loading.value = true;
  try {
    await deleteMember(id);
    await loadData(); // 重新加载数据
  } catch (error) {
    console.error('删除成员失败:', error);
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
  deleteImage(formData.id , 'member','avatar')
  formData.avatar = ""
}

const imageDelete2 = () => {
  console.log('出发删除',formData.id )
  deleteImage(formData.id , 'member','ct_avatar')
  formData.ct_avatar = ""
}

</script>

<template>
  <div class="p-4">
    <NCard title="成员管理" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NInput
            v-model:value="searchValue"
            placeholder="搜索姓名、中文姓名、年龄或个人简介"
            clearable
            style="width: 300px"
          />
          <NButton type="primary" @click="handleAdd">
            新增成员
          </NButton>
        </NSpace>
      </template>
      
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="{ pageSize: 10 }"
        :row-key="(row: MemberItem) => row.id"
        :scroll-x="1600"
      />
    </NCard>

    <!-- 新增/编辑弹窗 -->
    <NModal v-model:show="showModal" preset="dialog" style="width: 800px">
      <template #header>
        {{ editMode ? '编辑成员' : '新增成员' }}
      </template>
      
      <NForm
        :model="formData"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="英文姓名" path="name" required>
          <NInput v-model:value="formData.name" placeholder="请输入英文姓名" />
        </NFormItem>
        
        <NFormItem label="中文姓名" path="name_cn">
          <NSpace vertical style="width: 100%;">
          <NInput v-model:value="formData.name_cn" placeholder="请输入中文姓名" />
          <div style="font-size: 12px; color: #999;">
              中英文显示规则：中英文内容都输入，则中英文都显示，只输入英文，则只显示英文，只输入中文，则只显示中文
            </div>
            </NSpace>
        </NFormItem>
        
        <NFormItem label="头像链接" path="avatar">
          <CosUploader v-model="formData.avatar"
                prefix="member/avatar/" 
                @imageDelete="imageDelete"  />
        </NFormItem>
        
        <NFormItem label="卡通头像" path="ct_avatar">
          <CosUploader v-model="formData.ct_avatar"
                prefix="member/ct_avatar/" 
                @imageDelete="imageDelete2"  />
        </NFormItem>
        
        <NFormItem label="英文个人简介" path="description">
          <NInput
            v-model:value="formData.description"
            placeholder="请输入英文个人简介"
            type="textarea"
            :rows="3"
          />
        </NFormItem>
        
        <NFormItem label="中文个人简介" path="description_cn">
          <NInput
            v-model:value="formData.description_cn"
            placeholder="请输入中文个人简介"
            type="textarea"
            :rows="3"
          />
        </NFormItem>
        
        <NFormItem label="个人中心" path="link_url">
          <NInput
            v-model:value="formData.link_url"
            placeholder="请输入外部个人中心链接 (可选)"
          />
        </NFormItem>

        <NFormItem label="排序" path="sort">
          <NInputNumber
            v-model:value="formData.sort"
            placeholder="请输入排序值 (数字越小排序越前)"
            :min="0"
            :step="1"
            style="width: 100%"
          />
        </NFormItem>

                 <NFormItem label="角色" path="role">
           <NRadioGroup v-model:value="formData.role">
            <NRadio value="Professor">Professor</NRadio>
             <NRadio value="Staff">Staff</NRadio>
             <NRadio value="Student">Student</NRadio>
           </NRadioGroup>
         </NFormItem>
      </NForm>
      
      <template #action>
        <NSpace>
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" @click="handleSave">确定</NButton>
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