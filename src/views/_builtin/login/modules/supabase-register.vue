<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useSupabaseAuthStore } from '@/store/modules/auth/supabase-auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'SupabaseRegister' });

const authStore = useSupabaseAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

const model = reactive<FormModel>({
  email: '',
  password: '',
  confirmPassword: '',
  name: ''
});

const isRegistering = ref(false);

const rules = computed(() => {
  const { formRules } = useFormRules();
  
  return {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ] as any,
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
    ] as any,
    password: formRules.pwd,
    confirmPassword: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (_rule: any, value: string) => {
          return new Promise<void>((resolve, reject) => {
            if (value !== model.password) {
              reject(new Error('两次输入的密码不一致'));
            } else {
              resolve();
            }
          });
        },
        trigger: 'blur'
      }
    ] as any
  };
});

async function handleSubmit() {
  await validate();
  
  isRegistering.value = true;
  
  try {
    const { error } = await authStore.register(model.email, model.password, {
      name: model.name
    });
    
    if (!error) {
      window.$message?.success('注册成功！请检查您的邮箱并验证账户');
      // 切换到登录页面
      toggleLoginModule('pwd-login');
    }
  } finally {
    isRegistering.value = false;
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="name">
      <NInput v-model:value="model.name" placeholder="请输入姓名" />
    </NFormItem>
    
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
    
    <NFormItem path="confirmPassword">
      <NInput
        v-model:value="model.confirmPassword"
        type="password"
        show-password-on="click"
        placeholder="请确认密码"
      />
    </NFormItem>
    
    <NSpace vertical :size="24">
      <NButton 
        type="primary" 
        size="large" 
        round 
        block 
        :loading="isRegistering"
        @click="handleSubmit"
      >
        {{ $t('page.login.register.confirm') }}
      </NButton>
      
      <div class="flex-center">
        <NButton quaternary @click="toggleLoginModule('pwd-login')">
          {{ $t('page.login.register.switchToLogin') }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>

<style scoped></style> 