<script setup lang="ts">
import { Icon } from 'animal-island-vue'
import { RouterLink } from 'vue-router'

withDefaults(defineProps<{ preferenceCount?: number }>(), {
  preferenceCount: 0,
})
</script>

<template>
  <nav class="app-navigation fixed right-0 bottom-0 left-0 z-20 mx-auto flex w-full max-w-[560px] gap-2 border-t border-forest-dark/15 bg-paper/95 px-3 pt-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgb(49_83_62_/_10%)] backdrop-blur" aria-label="主要导航">
    <RouterLink to="/" class="flex min-h-13 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-muted transition-colors [&.router-link-exact-active]:bg-forest [&.router-link-exact-active]:text-white">
      <Icon name="icon-map" :size="22" />
      <span>今日菜单</span>
    </RouterLink>
    <RouterLink to="/preferences" class="flex min-h-13 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-muted transition-colors [&.router-link-exact-active]:bg-forest [&.router-link-exact-active]:text-white">
      <span class="relative leading-none">
        <Icon name="icon-variant" :size="22" />
        <b v-if="preferenceCount" class="absolute -top-2 -right-3 grid min-w-4 place-items-center rounded-full bg-clay px-1 py-0.5 text-[10px] leading-none text-white">{{ preferenceCount }}</b>
      </span>
      <span>口味偏好</span>
    </RouterLink>
  </nav>
</template>
