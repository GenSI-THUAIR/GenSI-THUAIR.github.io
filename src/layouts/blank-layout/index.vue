<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
const GlobalContent = defineAsyncComponent(() => import('../modules/global-content/index.vue'));

defineOptions({
  name: 'BlankLayout'
});

const route = useRoute();
const isPortal = computed(() => String(route.name ?? '').startsWith('portal_'));
</script>

<template>
  <div :class="{ 'portal-zoom': isPortal }">
    <GlobalContent :show-padding="false" />
  </div>
</template>

<style scoped>
.portal-zoom {
  /* Fast path for Chromium/WebKit */
  zoom: 0.87;
}

/* Firefox fallback */
@supports not (zoom: 1) {
  .portal-zoom {
    transform: scale(0.87);
    transform-origin: top center;
    width: calc(100% / 0.87);
    min-height: calc(100vh / 0.87);
    overflow: hidden;
  }
}
</style>
