<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { useMenuStore } from './stores/menu'
import { usePreferencesStore } from './stores/preferences'

const menuStore = useMenuStore()
const preferences = usePreferencesStore()
</script>

<template>
  <div class="app-shell">
    <div class="top-ribbon" aria-hidden="true">
      <span>一家三口</span>
      <span>好好吃饭</span>
      <span>今日份幸福</span>
    </div>

    <RouterView />

    <AppNavigation :preference-count="preferences.preferenceCount" />

    <Transition name="preference-toast">
      <div v-if="menuStore.feedback" class="preference-toast" role="status">
        <span aria-hidden="true">✓</span>
        {{ menuStore.feedback }}
      </div>
    </Transition>
  </div>
</template>
