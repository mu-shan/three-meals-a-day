<script setup lang="ts">
import { Footer } from 'animal-island-vue'

withDefaults(defineProps<{ showDescription?: boolean }>(), {
  showDescription: false,
})
</script>

<template>
  <footer class="mt-7 pt-4 text-center text-xs leading-6 text-muted">
    <p class="m-0 font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
    <span v-if="showDescription" class="block">菜单随机生成 · 少盐少辣照顾小朋友</span>
  </footer>
  <Footer type="tree" />
</template>
