<script setup>
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import COS from 'cos-js-sdk-v5';
import { cosSTSManager } from '@/utils/cos-sts';
import supabase from '@/supabase/supabase';

// COS 基础配置信息（不包含敏感密钥）
const cosConfig = {
  Protocol: 'https:', // 强制使用 HTTPS
  Bucket: import.meta.env.VITE_COS_BUCKET || '', // 存储桶名称
  Region: import.meta.env.VITE_COS_REGION || '', // 地域
  ServiceDomain: `https://cos.${import.meta.env.VITE_COS_REGION || 'ap-shanghai'}.myqcloud.com` // 用于 getService 的域名
};

// 永久密钥配置（从数据库获取，提供环境变量作为后备）
const permanentCredentials = {
  SecretId: import.meta.env.VITE_COS_SECRET_ID || '',
  SecretKey: import.meta.env.VITE_COS_SECRET_KEY || ''
};

// 密钥获取状态
let credentialsReady = false;
let credentialsError = null;

async function getKey() {
  try {
    console.log('正在从数据库获取 COS 配置...');
    const { data, error } = await supabase.from('keytable').select('*');
    
    if (error) {
      console.error('获取配置时数据库查询失败:', error);
      credentialsError = error;
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('数据库中没有找到配置记录');
      credentialsError = new Error('未找到配置记录');
      return false;
    }
    
    const configRecord = data[0];
    if (!configRecord.key || !configRecord.scr) {
      console.error('密钥记录不完整:', configRecord);
      credentialsError = new Error('密钥记录不完整');
      return false;
    }
    
    // 更新密钥
    permanentCredentials.SecretId = configRecord.key;
    permanentCredentials.SecretKey = configRecord.scr;
    
    // 更新 COS 配置
    if (configRecord.buname) {
      cosConfig.Bucket = configRecord.buname;
      console.log('✅ 从数据库获取 Bucket:', configRecord.buname);
    } else {
      console.warn('⚠️ 数据库中未找到 buname 字段，使用默认值');
    }
    
    if (configRecord.region) {
      cosConfig.Region = configRecord.region;
      // 同时更新 ServiceDomain
      cosConfig.ServiceDomain = `https://cos.${configRecord.region}.myqcloud.com`;
      console.log('✅ 从数据库获取 Region:', configRecord.region);
    } else {
      console.warn('⚠️ 数据库中未找到 region 字段，使用默认值');
    }
    
    credentialsReady = true;
    
    console.log('✅ 成功从数据库获取 COS 配置');
    console.log('当前 COS 配置:', {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      ServiceDomain: cosConfig.ServiceDomain
    });
    return true;
  } catch (error) {
    console.error('获取配置异常:', error);
    credentialsError = error;
    return false;
  }
}

// 初始化密钥获取
const initializeCredentials = getKey();


// 组件内部配置（写死的设置）
const config = {
  // 初始文件设置
  defaultFiles: '', // 可以修改为你需要的默认文件
  // 上传设置
  maxSize: 10, // MB
  maxFiles: 1,
  multiple: true,
  accept: 'image/*',
  listType: 'image-card'
};

// 支持 v-model 的 props
const props = defineProps({
  // v-model 绑定的值（文件路径字符串，逗号分隔）
  modelValue: {
    type: String,
    default: []
  },
  // 文件上传前缀路径
  prefix: {
    type: String,
    default: 'uploads/'
  }
});

// 定义 emits
const emit = defineEmits([
  'update:modelValue', // v-model 双向绑定事件
  'upload-success',
  'upload-error',
  'upload-progress',
  'before-upload',
  'file-remove',
  'image-delete'
]);

// 创建 COS 实例的函数
const createCOSInstance = async (credentials) => {
  if (credentials) {
    // 使用临时密钥
    console.log('使用 STS 临时密钥创建 COS 实例');
    return new COS({
      SecretId: credentials.SecretId,
      SecretKey: credentials.SecretKey,
      SecurityToken: credentials.SecurityToken,
      Protocol: cosConfig.Protocol
    });
  } else {
    // 使用永久密钥（等待密钥获取完成）
    if (!credentialsReady) {
      console.log('等待密钥从数据库加载...');
      const success = await initializeCredentials;
      if (!success) {
        const errorMsg = credentialsError 
          ? `❌ 从数据库获取密钥失败: ${credentialsError.message}` 
          : '❌ 密钥获取失败，未知错误';
        console.error(errorMsg);
        throw new Error('COS 密钥获取失败，无法创建实例');
      }
    }
    
    if (!permanentCredentials.SecretId || !permanentCredentials.SecretKey) {
      console.error('❌ 永久密钥未配置！请检查数据库中的密钥记录，或设置环境变量作为后备');
      throw new Error('COS 密钥未配置，无法创建实例');
    }
    
    console.log('使用数据库中的永久密钥创建 COS 实例');
    return new COS({
      SecretId: permanentCredentials.SecretId,
      SecretKey: permanentCredentials.SecretKey,
      Protocol: cosConfig.Protocol
    });
  }
};

// 默认COS实例（懒加载）
let cos = null;

// 获取或创建COS实例的函数
const getCOSInstance = async () => {
  if (!cos) {
    try {
      cos = await createCOSInstance();
    } catch (error) {
      console.warn('⚠️ COS 实例创建失败:', error.message);
      console.info('💡 建议：检查数据库密钥记录或配置环境变量作为后备');
      throw error;
    }
  }
  return cos;
};

// 创建消息提示和对话框实例
const message = useMessage();
const dialog = useDialog();

// 响应式数据
const uploadFileList = ref([]);
const uploadedImages = ref([]);

// 生成文件 URL
const generateFileUrl = async (key) => {
  // 确保配置已从数据库加载完成
  if (!credentialsReady) {
    console.log('等待 COS 配置从数据库加载...');
    const success = await initializeCredentials;
    if (!success) {
      console.warn('⚠️ 数据库配置加载失败，使用默认配置生成 URL');
    }
  }
  
  const protocol = cosConfig.Protocol || 'https:';
  return `${protocol}//${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com/${key}`;
};

// 解析默认文件字符串
const parseDefaultFiles = async (filesStr) => {
  if (!filesStr || !filesStr.trim()) {
    return [];
  }

  const files = [];
  const filePaths = filesStr.split(',');

  for (const path of filePaths) {
    const trimmedPath = path.trim();
    if (!trimmedPath) continue;

    let key, url, fileName;

    // 判断是否是完整URL
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      // 是完整URL，需要提取key
      try {
        const urlObj = new URL(trimmedPath);
        key = urlObj.pathname.substring(1); // 移除开头的斜杠
        url = trimmedPath;
        fileName = key.split('/').pop() || key;
      } catch (error) {
        console.error('解析URL失败:', trimmedPath);
        continue;
      }
    } else {
      // 是相对路径key
      key = trimmedPath;
      url = await generateFileUrl(trimmedPath);
      fileName = trimmedPath.split('/').pop() || trimmedPath;
    }

    files.push({
      key,
      name: fileName,
      url,
      size: 0, // 默认文件大小未知
      uploadTime: '预设文件',
      isDefault: true // 标记为默认文件
    });
  }

  return files;
};

// 上传处理
const handleUpload = async ({ file, onProgress, onError, onFinish }) => {
  const key = `${props.prefix}${Date.now()}-${file.name}`;

  try {
    // 触发上传前事件
    emit('before-upload', { file, key });

    // 尝试获取STS临时密钥
    let currentCos = null;
    
    if (cosSTSManager.isSTSEnabled()) {
      try {
        const stsCredentials = await cosSTSManager.getCredentials();
        if (stsCredentials) {
          // 使用临时密钥创建新的COS实例
          currentCos = await createCOSInstance(stsCredentials);
          console.log('使用 STS 临时密钥进行上传');
        } else {
          console.warn('获取 STS 临时密钥失败，降级使用永久密钥');
        }
      } catch (error) {
        console.error('STS 密钥获取异常，降级使用永久密钥:', error);
      }
    }

    // 如果没有STS密钥，获取默认COS实例
    if (!currentCos) {
      try {
        currentCos = await getCOSInstance();
      } catch (error) {
        const errorMsg = '❌ 无可用的 COS 配置！请检查数据库密钥记录或设置环境变量';
        console.error(errorMsg);
        message.error('上传失败：COS 未配置');
        onError();
        emit('upload-error', { file, error: new Error('COS 配置缺失') });
        return;
      }
    }

    const result = await currentCos.putObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: key,
      Body: file.file,
      onProgress: progressData => {
        const percent = Math.round(progressData.percent * 100);
        onProgress({ percent });
        emit('upload-progress', { file, percent, progressData });
      }
    });

    // 添加到已上传的图片列表
    const imageUrl = await generateFileUrl(key);
    const imageInfo = {
      key,
      name: file.name,
      url: imageUrl,
      size: file.file.size,
      uploadTime: new Date().toLocaleString(),
      cosResult: result
    };

    uploadedImages.value.push(imageInfo);

    // 将已上传的文件添加到上传列表中，这样就可以在UI中看到并删除
    uploadFileList.value.push({
      id: imageInfo.key,
      name: imageInfo.name,
      status: 'finished',
      url: imageInfo.url,
      key: imageInfo.key,
      file: null,
      percentage: 100
    });

    message.success(`${file.name} 上传成功！`);
    onFinish();

    // 更新 v-model 绑定的值
    updateModelValue();

    // 触发成功事件
    emit('upload-success', { file, imageInfo, result });
  } catch (error) {
    console.error('上传失败:', error);
    message.error(`${file.name} 上传失败: ${error.message}`);
    onError();

    // 触发错误事件
    emit('upload-error', { file, error });
  }
};

// 上传前检查
const beforeUpload = data => {
  const { file } = data;
  const isValidType = file.type?.startsWith('image/');
  const isValidSize = file.size < config.maxSize * 1024 * 1024;

  if (!isValidType) {
    message.warning('只能上传图片文件！');
    return false;
  }
  if (!isValidSize) {
    message.warning(`图片大小不能超过 ${config.maxSize}MB！`);
    return false;
  }
  return true;
};

// 移除文件（处理上传列表中的文件和已上传的文件）
const handleRemove = async fileAndIndex => {
  const { file, index } = fileAndIndex;

  console.log('准备删除文件:', file);

  // 如果文件有 url 属性，说明是已上传的文件，需要从服务器删除
  if (file.url || file.key) {
    return new Promise((resolve) => {
      dialog.warning({
        title: '确认删除',
        content: `确定要删除 ${file.name} 吗？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          await deleteFileFromCos(file, resolve);
        },
        onNegativeClick: () => {
          resolve(false);
        }
      });
    });
  } else {
    // 普通的上传列表文件移除
    if (uploadFileList.value && uploadFileList.value.length > index) {
      const removedFile = uploadFileList.value[index];
      uploadFileList.value.splice(index, 1);
      emit('file-remove', { file: removedFile, index });
    }
    return true;
  }
};

// 从COS删除文件的具体逻辑
const deleteFileFromCos = async (file, resolve) => {
  try {
    // 确定正确的文件key
    let fileKey = file.key;
    if (!fileKey && file.url) {
      // 从完整URL中提取key，包含路径前缀
      const url = new URL(file.url);
      fileKey = url.pathname.substring(1); // 移除开头的斜杠
    }

    console.log('删除文件key:', fileKey);

    // 尝试获取STS临时密钥进行删除
    let currentCos = null;
    
    if (cosSTSManager.isSTSEnabled()) {
      try {
        const stsCredentials = await cosSTSManager.getCredentials();
        if (stsCredentials) {
          currentCos = await createCOSInstance(stsCredentials);
          console.log('使用 STS 临时密钥进行删除');
        } else {
          console.warn('获取 STS 临时密钥失败，降级使用永久密钥删除');
        }
      } catch (error) {
        console.error('STS 密钥获取异常，降级使用永久密钥删除:', error);
      }
    }

    // 如果没有STS密钥，获取默认COS实例
    if (!currentCos) {
      try {
        currentCos = await getCOSInstance();
      } catch (error) {
        const errorMsg = '❌ 无可用的 COS 配置！请检查数据库密钥记录或设置环境变量';
        console.error(errorMsg);
        message.error('删除失败：COS 未配置');
        resolve(false);
        return;
      }
    }

    // 从COS删除文件
    const deleteResult = await currentCos.deleteObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: fileKey
    });

    console.log('COS删除结果:', deleteResult);

    // 从 uploadedImages 中移除
    const imgIndex = uploadedImages.value.findIndex(img => img.key === fileKey);
    if (imgIndex > -1) {
      uploadedImages.value.splice(imgIndex, 1);
      console.log('从 uploadedImages 中移除了索引:', imgIndex);
    }

    // 从 uploadFileList 中移除
    const uploadIndex = uploadFileList.value.findIndex(item => item.key === fileKey);
    if (uploadIndex > -1) {
      uploadFileList.value.splice(uploadIndex, 1);
      console.log('从 uploadFileList 中移除了索引:', uploadIndex);
    }

    // 更新 v-model 绑定的值
    updateModelValue();
    emit('image-delete');
    message.success('删除成功！');
    emit('image-delete', { image: file });
    resolve(true);
  } catch (error) {
    console.error('删除失败:', error);
    console.error('错误详情:', error);
    message.error(`删除失败: ${error.message}`);
    resolve(false);
  }
};

// 初始化默认文件
const initDefaultFiles = async (filesStr = null) => {
  // 使用传入的字符串，或者使用 modelValue，或者使用内部配置
  const targetStr = filesStr || props.modelValue || config.defaultFiles;
  if (targetStr) {
    const defaultFileList = await parseDefaultFiles(targetStr);
    uploadedImages.value = [...defaultFileList];

    // 同时添加到上传列表中以便显示和删除
    uploadFileList.value = defaultFileList.map(img => ({
      id: img.key,
      name: img.name,
      status: 'finished',
      url: img.url,
      key: img.key,
      file: null,
      percentage: 100
    }));

    console.log('已加载文件:', defaultFileList);
  }
};

// 监听 modelValue 变化，同步更新内部状态
watch(
  () => props.modelValue,
  async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      console.log('modelValue 变化:', newValue);
      await initDefaultFiles(newValue);
    }
  },
  { immediate: false }
);



// 获取当前所有文件路径的字符串（逗号分隔） - 返回完整URL
const getFilePathsString = () => {
  return uploadedImages.value.map(img => img.url).join(',');
};

// 更新 modelValue 并通知父组件
const updateModelValue = () => {
  const newValue = getFilePathsString();
  emit('update:modelValue', newValue);
  console.log('更新 modelValue:', newValue);
};

// 暴露方法给父组件
defineExpose({
  uploadedImages,
  getCOSInstance, // 获取COS实例的异步方法
  getFilePathsString, // 获取文件路径字符串
  initDefaultFiles, // 重新初始化默认文件
  credentialsReady, // 密钥准备状态
  credentialsError // 密钥获取错误信息
});

// 组件挂载时自动加载
onMounted(async () => {
  console.log('CosUploader 组件已挂载');

  // 只加载默认文件，不从桶里获取其他文件
  await initDefaultFiles();
});
</script>

<template>
  <div class="cos-uploader">
    <NUpload v-model:file-list="uploadFileList" :custom-request="handleUpload" :before-upload="beforeUpload"
             :multiple="config.multiple" :accept="config.accept" :max="config.maxFiles" :list-type="config.listType"
             @remove="handleRemove"></NUpload>
  </div>
</template>

<style scoped></style>
