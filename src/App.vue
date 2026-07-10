<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useMenuStore } from './stores/menu'

const menuStore = useMenuStore()
</script>

<template>
  <div class="app-shell">
    <div class="top-ribbon" aria-hidden="true">
      <span>一家三口</span>
      <span>好好吃饭</span>
      <span>今日份幸福</span>
    </div>

    <RouterView />

    <Transition name="preference-toast">
      <div v-if="menuStore.feedback" class="preference-toast" role="status">
        <span aria-hidden="true">✓</span>
        {{ menuStore.feedback }}
      </div>
    </Transition>
  </div>
</template>
