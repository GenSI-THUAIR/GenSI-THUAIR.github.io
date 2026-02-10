<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useSupabaseAuthStore } from '@/store/modules/auth/supabase-auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'SupabasePwdLogin' });

const authStore = useSupabaseAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
  password: string;
}

const model = reactive<FormModel>({
  email: '',
  password: ''
});

const rules = computed(() => {
  const { formRules } = useFormRules();
  return {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ] as any, // 类型断言为 any 以修复 linter 错误
    password: formRules.pwd
  };
});

async function handleSubmit() {
  try {
    await validate();
    await authStore.login(model.email, model.password);
  } catch (error) {
    console.error('登录验证失败:', error);
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('page.login.common.emailPlaceholder')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      
      <!-- 注册和其他登录方式 -->
      <!-- <div class="flex-y-center justify-between text-sm">
        <NButton quaternary @click="toggleLoginModule('register')">
          {{ $t('page.login.pwdLogin.register') }}
        </NButton>
        <NButton quaternary @click="toggleLoginModule('code-login')">
          {{ $t('page.login.common.codeLogin') }}
        </NButton>
      </div> -->
    </NSpace>
  </NForm>
</template>

<style scoped></style> 