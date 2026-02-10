<script setup lang="ts">
import { computed } from 'vue';
import FlipCard from './FlipCard.vue';
import { useAppStore } from '@/store/modules/app';

interface Props {
  name: string;
  name_cn?: string;
  avatar: string;
  ctavatar: string;
  description: string;
  description_cn?: string;
  type?: 'professor' | 'staff' | 'student';
  link?: string;
  showWindow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'staff',
  showWindow: false
});

const appStore = useAppStore();

// 根据当前语言显示对应的名称
const displayName = computed(() => {
  if (appStore.locale === 'zh-CN') {
    return props.name_cn || props.name;
  }
  return props.name;
});

// 根据当前语言显示对应的描述
const displayDescription = computed(() => {
  if (appStore.locale === 'zh-CN') {
    return props.description_cn || props.description;
  }
  return props.description;
});

const handleLinkClick = () => {
  if (props.link) {
    window.open(props.link, '_blank');
  }
};
</script>

<template>
  <div class="block">
    <div class="flex items-center justify-start">
    <FlipCard class="h-72 w-full">
      <template #default>
        <img
          :src="ctavatar"
          alt="image"
          class="size-full rounded-2xl object-cover shadow-2xl shadow-black/40"
        />
      </template>
      <template #back>
        <div class="relative size-full">
          <!-- 背景图片 -->
          <img
            :src="avatar"
            alt="image"
            class="size-full rounded-2xl object-cover"
          />
          <!-- 毛玻璃描述区域 -->
          <div class="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gray-600/30 backdrop-blur-md border-t border-gray-400/30" v-if="displayDescription">
            <div class="px-4 py-2">
              <!-- <h1 class="text-lg font-bold text-white mb-2">{{ displayName }}</h1> -->
              <p class="text-sm text-white leading-tight">
                {{ displayDescription }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </FlipCard>
    </div>
    <div class="member-name flex justify-between ">
       <div> {{ displayName }}</div>
       <div class="member-link" v-if="link">
                <button class="action-button" @click="handleLinkClick">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
        </div>
    </div>

  </div>
</template>

<style scoped>
/* 限制卡片在网格中的最大宽度，避免单个项拉伸至整行 */
.block {
  width: 100%;
  max-width: 18rem;
}

.member-link {
  flex-shrink: 0;
}

.action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 0.125rem solid #e0e0e0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #000000;
  padding: 0;
  transform: rotate(45deg);
}

.member-link:hover .action-button {
  background-color: #000000;
  color: #d7ff39;
  border-color: #000000;
}
.member-card {
  background: #ffffff;
  border: 0.125rem solid #000000;
  border-radius: 1.5rem;
  padding: 0;
  width: 23.3125rem;
  height: 31.0625rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.member-card:hover {
  transform: translateY(-0.3125rem);
  box-shadow: 0 0.625rem 1.875rem rgba(0, 0, 0, 0.1);
}

.member-image {
  width: 23.3125rem;
  height: 21.25rem;
  overflow: hidden;
  margin: 0;
  position: relative;
  flex-shrink: 0;
}

.member-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: #000000;
  position: relative;
}

.professor-card .member-content {
  background: #ffffff;
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.875rem 0.625rem 1.875rem;
  position: relative;
  z-index: 2;
  background: transparent;
}

.member-name {
  font-size: 1.375rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 2.5rem;
  margin-top: 1.25rem;
  align-items: center;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
}

.member-link {
  width: 2.5rem;
  height: 2.5rem;
  background: #ffffff;
  border: 0.125rem solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.member-link:hover {
  background: #000000;
  color: #ffffff;
  transform: scale(1.05);
}

.member-description {
  font-size: 1.25rem;
  color: #ffffff;
  margin: 0;
  padding: 0.625rem 1.875rem 1.875rem 1.875rem;
  line-height: 2.75rem;
  font-weight: 400;
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
}

.professor-description {
  color: #000000;
  background: transparent;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .block {
    max-width: 18rem;
  }
  
  .member-card {
    width: 100%;
    max-width: 23.3125rem;
    margin: 0 auto;
  }
  
  .member-image {
    width: 100%;
    height: 15.625rem;
  }
  
  .member-name {
    font-size: 1.5rem;
  }
  
  .member-description {
    font-size: 1rem;
  }
  
  .action-button {
    width: 2rem;
    height: 2rem;
  }
}
</style> 