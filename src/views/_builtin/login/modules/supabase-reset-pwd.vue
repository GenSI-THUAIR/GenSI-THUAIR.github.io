<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useSupabaseAuthStore } from '@/store/modules/auth/supabase-auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'SupabaseResetPwd' });

const authStore = useSupabaseAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
}

const model = reactive<FormModel>({
  email: ''
});

const isResetting = ref(false);

const rules = computed(() => {
  return {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ] as any
  };
});

async function handleSubmit() {
  await validate();
  
  isResetting.value = true;
  
  try {
    const { error } = await authStore.resetPassword(model.email);
    
    if (!error) {
      window.$message?.success('密码重置邮件已发送！请检查您的邮箱');
      // 可以选择切换回登录页面
      setTimeout(() => {
        toggleLoginModule('pwd-login');
      }, 2000);
    }
  } finally {
    isResetting.value = false;
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </NFormItem>
    
    <NSpace vertical :size="24">
      <div class="text-sm text-gray-500 text-center">
        输入您的邮箱地址，我们将向您发送密码重置链接
      </div>
      
      <NButton 
        type="primary" 
        size="large" 
        round 
        block 
        :loading="isResetting"
        @click="handleSubmit"
      >
        {{ $t('page.login.resetPwd.confirm') }}
      </NButton>
      
      <div class="flex-center">
        <NButton quaternary @click="toggleLoginModule('pwd-login')">
          {{ $t('page.login.resetPwd.switchToLogin') }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>

<style scoped></style> 