<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { useMenuStore } from './stores/menu'
import { usePreferencesStore } from './stores/preferences'

const menuStore = useMenuStore()
const preferences = usePreferencesStore()
const isFullPageLoading = computed(() => menuStore.shuffleTarget?.scope === 'all')
let previousActiveElement: HTMLElement | null = null

const refreshDate = () => menuStore.refreshDate()
const refreshWhenVisible = () => {
  if (document.visibilityState === 'visible') refreshDate()
}

// 整桌换新期间隔离背景交互，并在菜单更新完成后把焦点还给触发操作。
watch(isFullPageLoading, async (loading) => {
  if (loading) {
    previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    return
  }

  if (previousActiveElement) {
    await nextTick()
    previousActiveElement.focus()
    previousActiveElement = null
  }
})

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
    <div
      data-testid="app-content"
      :inert="isFullPageLoading ? '' : undefined"
      :aria-busy="isFullPageLoading"
    >
      <RouterView />

      <AppNavigation :preference-count="preferences.preferenceCount" />
    </div>

    <Transition name="full-page-loading">
      <div
        v-if="isFullPageLoading"
        data-testid="full-page-loading"
        class="fixed inset-y-0 left-1/2 z-50 grid w-full max-w-[560px] -translate-x-1/2 place-items-center bg-forest-dark/45 px-6 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="w-full max-w-xs rounded-[2rem] border-2 border-ink/15 bg-paper px-6 py-7 text-center shadow-paper motion-safe:animate-pulse">
          <span class="block text-4xl" aria-hidden="true">🏝️</span>
          <p class="mt-4 mb-0 font-display text-xl font-bold text-ink">正在给餐桌换新菜…</p>
          <p class="mt-2 mb-0 text-sm font-semibold text-muted">马上就开饭</p>
        </div>
      </div>
    </Transition>

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
