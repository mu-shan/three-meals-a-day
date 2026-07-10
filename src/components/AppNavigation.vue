<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(defineProps<{ preferenceCount?: number }>(), {
  preferenceCount: 0,
})
</script>

<template>
  <nav class="app-navigation" aria-label="主要导航">
    <RouterLink to="/">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9M9.5 19v-5h5v5" />
      </svg>
      <span>今日菜单</span>
    </RouterLink>
    <RouterLink to="/preferences">
      <span class="app-navigation__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
        </svg>
        <b v-if="preferenceCount">{{ preferenceCount }}</b>
      </span>
      <span>口味偏好</span>
    </RouterLink>
  </nav>
</template>
