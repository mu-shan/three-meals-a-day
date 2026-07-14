<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { useMenuStore } from './stores/menu'
import { usePreferencesStore } from './stores/preferences'

const menuStore = useMenuStore()
const preferences = usePreferencesStore()

const refreshDate = () => menuStore.refreshDate()
const refreshWhenVisible = () => {
  if (document.visibilityState === 'visible') refreshDate()
}

onMounted(() => {
  window.addEventListener('focus', refreshDate)
  document.addEventListener('visibilitychange', refreshWhenVisible)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshDate)
  document.removeEventListener('visibilitychange', refreshWhenVisible)
})
</script>

<template>
  <div class="app-shell relative mx-auto min-h-dvh w-full max-w-[560px] overflow-hidden border-x border-forest-dark/15 bg-[repeating-linear-gradient(0deg,transparent_0_31px,rgb(72_103_71_/_4.5%)_31px_32px),linear-gradient(155deg,#f8e5aa,#efd07b)] pb-[calc(88px+env(safe-area-inset-bottom))] shadow-[0_0_60px_rgb(45_66_48_/_18%)]">
    <RouterView />

    <AppNavigation :preference-count="preferences.preferenceCount" />

    <Transition name="preference-toast">
      <div
        v-if="menuStore.feedback"
        class="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[528px] -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-paper"
        role="status"
      >
        <span aria-hidden="true">✓</span>
        {{ menuStore.feedback }}
      </div>
    </Transition>
  </div>
</template>
