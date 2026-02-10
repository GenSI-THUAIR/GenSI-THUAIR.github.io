<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  NCard, NForm, NFormItem, NInput, NButton, NSpace, useMessage, NSpin
} from 'naive-ui';
import supabase from '@/supabase/supabase';

// 定义页面描述数据类型
interface PageDescription {
  home: string;
  home_cn: string;
  research: string;
  research_cn: string;
  about: string;
  about_cn: string;
}

defineOptions({
  name: 'PageDescription'
});

const $message = useMessage();
const loading = ref(false);
const saving = ref(false);

// 表单数据
const formData = ref<PageDescription>({
  home: '',
  home_cn: '',
  research: '',
  research_cn: '',
  about: '',
  about_cn: ''
});

// 字段配置
const fieldConfigs = [
  {
    key: 'home' as keyof PageDescription,
    label: 'home',
    placeholder: '请输入home描述内容...'
  },
  {
    key: 'home_cn' as keyof PageDescription,
    label: 'home（中文）',
    placeholder: '请输入home中文描述内容...'
  },
  {
    key: 'research' as keyof PageDescription,
    label: 'research',
    placeholder: '请输入research描述内容...'
  },
  {
    key: 'research_cn' as keyof PageDescription,
    label: 'research（中文）',
    placeholder: '请输入research中文描述内容...'
  },
  {
    key: 'about' as keyof PageDescription,
    label: 'about',
    placeholder: '请输入about描述内容...'
  },
  {
    key: 'about_cn' as keyof PageDescription,
    label: 'about（中文）',
    placeholder: '请输入about中文描述内容...'
  }
];

// 加载页面描述数据
const loadDescriptions = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.from('description').select('*').eq('id', 1).single();
    if (error) {
      throw error;
    }
    if (data) {
      formData.value = {
        home: data.home || '',
        home_cn: data.home_cn || '',
        research: data.research || '',
        research_cn: data.research_cn || '',
        about: data.about || '',
        about_cn: data.about_cn || ''
      } as PageDescription;
    }
    $message.success('页面描述加载成功');
  } catch (error) {
    console.error('加载页面描述失败:', error);
    $message.error('加载页面描述失败');
  } finally {
    loading.value = false;
  }
};

// 保存页面描述
const handleSave = async () => {
  // 基本验证
  const isEmpty = Object.values(formData.value).every(value => !value.trim());
  if (isEmpty) {
    $message.warning('请至少填写一个页面描述');
    return;
  }

  saving.value = true;
  try {
    const { error } = await supabase
      .from('description')
      .update({
        home: formData.value.home,
        home_cn: formData.value.home_cn,
        research: formData.value.research,
        research_cn: formData.value.research_cn,
        about: formData.value.about,
        about_cn: formData.value.about_cn
      })
      .eq('id', 1);

    if (error) {
      throw error;
    }

    $message.success('页面描述保存成功');
  } catch (error) {
    console.error('保存页面描述失败:', error);
    $message.error('保存页面描述失败');
  } finally {
    saving.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formData.value = {
    home: '',
    home_cn: '',
    research: '',
    research_cn: '',
    about: '',
    about_cn: ''
  } as PageDescription;
  $message.info('表单已重置');
};

// 组件挂载时加载数据
onMounted(() => {
  loadDescriptions();
});
</script>

<template>
  <div class="p-4">
    <NCard title="页面描述维护" :bordered="false">
      <template #header-extra>
        <NSpace>
          <NButton @click="handleReset" :disabled="saving">
            重置
          </NButton>
          <NButton 
            type="primary" 
            @click="handleSave" 
            :loading="saving"
            :disabled="loading"
          >
            保存
          </NButton>
        </NSpace>
      </template>

      <NSpin :show="loading">
        <NForm
          :model="formData"
          label-placement="top"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <div class="grid gap-6">
            <NFormItem 
              v-for="config in fieldConfigs"
              :key="config.key"
              :label="config.label"
              :path="config.key"
            >
              <NInput
                v-model:value="formData[config.key]"
                type="textarea"
                :placeholder="config.placeholder"
                :rows="6"
                maxlength="1000"
                show-count
                clearable
                :disabled="saving"
              />
            </NFormItem>
          </div>
        </NForm>
      </NSpin>
    </NCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

:deep(.n-input__textarea) {
  resize: vertical;
  min-height: 120px;
}

:deep(.n-form-item-label) {
  font-weight: 600;
  color: var(--n-text-color);
}
</style>
