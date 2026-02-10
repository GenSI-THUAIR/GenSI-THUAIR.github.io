<template>
  <Teleport to="body">
    <Transition name="back-to-top" appear>
      <button
        v-if="isVisible"
        class="back-to-top-btn"
        @click="scrollToTop"
        aria-label="返回顶部"
        title="返回顶部"
      >
        <svg
          class="back-to-top-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 19V5M5 12L12 5L19 12"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const scrollThreshold = 100; // 降低阈值用于测试，滚动100px后显示按钮

// 检测是否为移动端
const isMobile = () => {
  return window.innerWidth <= 768;
};

// 检查滚动位置 - 改进移动端兼容性
const checkScrollPosition = () => {
  // 支持多种滚动位置获取方式，确保移动端兼容性
  const scrollTop = window.scrollY || 
    window.pageYOffset || 
    document.documentElement.scrollTop || 
    document.body.scrollTop || 0;
  
  // 在移动端使用更低的阈值，或者在开发模式下强制显示
  const mobileThreshold = isMobile() ? 20 : scrollThreshold; // 移动端只需滚动20px
  const shouldShow = scrollTop > mobileThreshold;
  
  const forceShowInMobile =  isMobile();
  
  isVisible.value = shouldShow || forceShowInMobile;
};

// 滚动到顶部
const scrollToTop = () => {
  // 确保在移动端也能正确滚动
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // 兼容旧版浏览器
  if (document.documentElement.scrollTop) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body.scrollTop) {
    document.body.scrollTop = 0;
  }
};

// 节流函数，优化滚动性能
let ticking = false;
const throttledScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      checkScrollPosition();
      ticking = false;
    });
    ticking = true;
  }
};

onMounted(() => {
  // 监听多个滚动事件源，确保移动端兼容性
  window.addEventListener('scroll', throttledScroll, { passive: true });
  document.addEventListener('scroll', throttledScroll, { passive: true });
  
  // 监听触摸滚动事件（移动端）
  window.addEventListener('touchmove', throttledScroll, { passive: true });
  
  checkScrollPosition(); // 初始检查
});

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScroll);
  document.removeEventListener('scroll', throttledScroll);
  window.removeEventListener('touchmove', throttledScroll);
});
</script>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 56px;
  height: 56px;
  background: #000000;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  z-index: 1002; /* 提高z-index，确保在移动端菜单之上 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.back-to-top-btn:hover {
  background: #333333;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.back-to-top-btn:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

.back-to-top-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.back-to-top-btn:hover .back-to-top-icon {
  transform: translateY(-2px);
}

/* 进入和离开动画 */
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-enter-to,
.back-to-top-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .back-to-top-btn {
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    /* 确保在移动端显示 */
    display: flex !important;
    opacity: 1;
    visibility: visible;
    /* 改善移动端触摸体验 */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    /* 确保在所有移动端浏览器中正确显示 */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    /* 防止被其他元素遮挡 */
    position: fixed !important;
    z-index: 1002 !important;
  }

  .back-to-top-icon {
    width: 20px;
    height: 20px;
  }
  
  /* 移动端点击效果 */
  .back-to-top-btn:active {
    transform: translateY(1px) scale(0.95);
    transition: transform 0.1s ease;
  }
}

@media (max-width: 480px) {
  .back-to-top-btn {
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    /* 确保在小屏幕设备上显示 */
    display: flex !important;
    opacity: 1;
    visibility: visible;
  }

  .back-to-top-icon {
    width: 18px;
    height: 18px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .back-to-top-btn {
    border: 2px solid #ffffff;
  }
}

/* 减少动画的用户偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .back-to-top-btn,
  .back-to-top-icon,
  .back-to-top-enter-active,
  .back-to-top-leave-active {
    transition: none;
  }

  .back-to-top-btn:hover .back-to-top-icon {
    transform: none;
  }
}
</style> 