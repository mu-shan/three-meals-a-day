<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(defineProps<{ preferenceCount?: number }>(), {
  preferenceCount: 0,
})
</script>

<template>
  <nav class="app-navigation fixed bottom-0 left-1/2 z-[45] grid w-full max-w-[560px] -translate-x-1/2 grid-cols-2 gap-2 border-t-[3px] border-ink bg-paper/95 px-3 pt-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgb(49_83_62_/_10%)] backdrop-blur" aria-label="主要导航">
    <RouterLink to="/" class="flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-muted transition-colors [&.router-link-exact-active]:bg-forest-dark [&.router-link-exact-active]:text-white">
      <svg
        data-icon="home"
        class="size-[23px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-7h6v7" />
      </svg>
      <span>今日菜单</span>
    </RouterLink>
    <RouterLink to="/preferences" class="flex min-h-13 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-muted transition-colors [&.router-link-exact-active]:bg-forest-dark [&.router-link-exact-active]:text-white">
      <span class="relative leading-none">
        <svg
          data-icon="heart"
          class="size-[23px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
        </svg>
        <b v-if="preferenceCount" class="absolute -top-2 -right-3 grid min-w-4 place-items-center rounded-full bg-clay px-1 py-0.5 text-[10px] leading-none text-white">{{ preferenceCount }}</b>
      </span>
      <span>口味偏好</span>
    </RouterLink>
  </nav>
</template>
