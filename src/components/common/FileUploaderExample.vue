<template>
  <div class="file-uploader-example">
    <NH2>文件上传组件示例</NH2>
    
    <div class="example-section">
      <NH3>基础使用</NH3>
      <NP>支持上传 PDF 和 Markdown 文件，最大 50MB，最多 5 个文件</NP>
      
      <FileUploader 
        v-model="fileList1" 
        prefix="documents/basic/"
        @upload-success="onUploadSuccess"
        @upload-error="onUploadError"
        @file-delete="onFileDelete"
      />
      
      <div v-if="fileList1" class="result-display">
        <NH4>绑定值：</NH4>
        <NCode :code="fileList1" language="text" />
      </div>
    </div>

    <div class="example-section">
      <NH3>带默认文件</NH3>
      <NP>可以设置默认已上传的文件</NP>
      
      <FileUploader 
        v-model="fileList2" 
        prefix="documents/default/"
        @upload-success="onUploadSuccess"
        @upload-error="onUploadError"
        @file-delete="onFileDelete"
      />
      
      <div v-if="fileList2" class="result-display">
        <NH4>绑定值：</NH4>
        <NCode :code="fileList2" language="text" />
      </div>
    </div>

    <div class="example-section">
      <NH3>API 方法示例</NH3>
      <NSpace>
        <NButton @click="getFiles">获取文件列表</NButton>
        <NButton @click="clearFiles">清空文件</NButton>
        <NButton @click="setDefaultFiles">设置默认文件</NButton>
      </NSpace>
      
      <FileUploader 
        ref="fileUploaderRef"
        v-model="fileList3" 
        prefix="documents/api/"
        @upload-success="onUploadSuccess"
        @upload-error="onUploadError"
        @file-delete="onFileDelete"
      />
    </div>

    <!-- 事件日志 -->
    <div class="example-section">
      <NH3>事件日志</NH3>
      <div class="event-log">
        <div v-for="(event, index) in eventLog" :key="index" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type" :class="`event-${event.type}`">{{ event.type }}</span>
          <span class="event-message">{{ event.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import FileUploader from './FileUploader.vue';

const message = useMessage();

// 响应式数据
const fileList1 = ref('');
const fileList2 = ref('');
const fileList3 = ref('');
const fileUploaderRef = ref(null);
const eventLog = ref([]);

// 添加事件到日志
const addEventLog = (type, message) => {
  eventLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  });
  
  // 限制日志数量
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20);
  }
};

// 事件处理函数
const onUploadSuccess = ({ file, fileInfo }) => {
  addEventLog('success', `文件上传成功: ${file.name}`);
  message.success(`${file.name} 上传成功！`);
};

const onUploadError = ({ file, error }) => {
  addEventLog('error', `文件上传失败: ${file.name} - ${error.message}`);
  message.error(`${file.name} 上传失败！`);
};

const onFileDelete = ({ file }) => {
  addEventLog('delete', `文件删除: ${file?.name || '未知文件'}`);
  message.info('文件已删除');
};

// API 方法示例
const getFiles = () => {
  if (fileUploaderRef.value) {
    const files = fileUploaderRef.value.getFilePathsString();
    addEventLog('info', `当前文件列表: ${files || '无文件'}`);
    message.info(`当前有 ${fileUploaderRef.value.uploadedFiles.length} 个文件`);
  }
};

const clearFiles = () => {
  fileList3.value = '';
  addEventLog('info', '已清空文件列表');
  message.info('文件列表已清空');
};

const setDefaultFiles = () => {
  // 设置一些示例文件（这些文件可能不存在，仅用于演示）
  const sampleFiles = [
    'https://gensi-1316936694.cos.ap-shanghai.myqcloud.com/documents/sample1.pdf',
    'https://gensi-1316936694.cos.ap-shanghai.myqcloud.com/documents/readme.md'
  ].join(',');
  
  fileList3.value = sampleFiles;
  addEventLog('info', '已设置默认文件');
  message.info('已设置默认文件');
};

// 组件挂载时设置默认文件
onMounted(() => {
  // 为第二个示例设置默认文件
  fileList2.value = 'https://gensi-1316936694.cos.ap-shanghai.myqcloud.com/documents/example.pdf';
  
  addEventLog('info', '组件示例已加载');
});
</script>

<style scoped>
.file-uploader-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  background-color: var(--n-card-color);
}

.result-display {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--n-code-color);
  border-radius: 6px;
}

.event-log {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background-color: var(--n-code-color);
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  padding: 4px 0;
}

.event-time {
  color: var(--n-text-color-3);
  margin-right: 12px;
  min-width: 80px;
}

.event-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  margin-right: 12px;
  min-width: 60px;
  text-align: center;
  font-size: 11px;
}

.event-success {
  background-color: var(--n-success-color);
  color: white;
}

.event-error {
  background-color: var(--n-error-color);
  color: white;
}

.event-delete {
  background-color: var(--n-warning-color);
  color: white;
}

.event-info {
  background-color: var(--n-info-color);
  color: white;
}

.event-message {
  flex: 1;
  color: var(--n-text-color-1);
}
</style> 