<script setup lang="ts">
import { computed, reactive, ref, onUnmounted } from 'vue';
import { useSupabaseAuthStore } from '@/store/modules/auth/supabase-auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'SupabaseCodeLogin' });

const authStore = useSupabaseAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
}

const model = reactive<FormModel>({
  email: ''
});

const isSendingCode = ref(false);
const countdown = ref(0);
const timer = ref<NodeJS.Timeout>();

const rules = computed(() => {
  return {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ] as any
  };
});

const canSendCode = computed(() => !isSendingCode.value && countdown.value === 0);

async function handleSendCode() {
  if (!model.email) {
    window.$message?.error('请先输入邮箱地址');
    return;
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(model.email)) {
    window.$message?.error('请输入正确的邮箱格式');
    return;
  }

  isSendingCode.value = true;
  
  try {
    const { error } = await authStore.loginWithOtp(model.email);
    
    if (!error) {
      // 开始倒计时
      countdown.value = 60;
      timer.value = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer.value);
        }
      }, 1000);
    }
  } finally {
    isSendingCode.value = false;
  }
}

const buttonText = computed(() => {
  if (isSendingCode.value) return '发送中...';
  if (countdown.value > 0) return `${countdown.value}秒后重新发送`;
  return '发送验证码';
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </NFormItem>
    
    <NSpace vertical :size="24">
      <NButton 
        type="primary" 
        size="large" 
        round 
        block 
        :loading="isSendingCode"
        :disabled="!canSendCode"
        @click="handleSendCode"
      >
        {{ buttonText }}
      </NButton>
      
      <div class="flex-center">
        <NButton quaternary @click="toggleLoginModule('pwd-login')">
          {{ $t('page.login.codeLogin.switchToPwdLogin') }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>

<style scoped></style> 