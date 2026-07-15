<script setup lang="ts">
import { Footer } from 'animal-island-vue'
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DataBackupPanel from '../components/DataBackupPanel.vue'
import PreferenceDishList from '../components/PreferenceDishList.vue'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'
import type { AppBackupV1 } from '../types/menu'

type PreferenceTab = 'liked' | 'disliked'

const preferenceTabs = ['liked', 'disliked'] as const satisfies readonly PreferenceTab[]
const activeTab = ref<PreferenceTab>('liked')
const likedTabButton = ref<HTMLButtonElement | null>(null)
const dislikedTabButton = ref<HTMLButtonElement | null>(null)
const tabButtons = {
  liked: likedTabButton,
  disliked: dislikedTabButton,
}
const preferences = usePreferencesStore()
const menuStore = useMenuStore()

menuStore.initialize()

const visibleDishes = computed(() =>
  activeTab.value === 'liked' ? preferences.likedDishes : preferences.dislikedDishes,
)

const tabClass = (tab: PreferenceTab) => [
  'min-h-11 rounded-xl border-2 px-2 text-xs font-bold transition-colors',
  activeTab.value === tab
    ? 'border-forest bg-forest text-white shadow-[0_4px_0_rgba(49,105,72,0.2)]'
    : 'border-line bg-paper-soft text-muted',
]

const selectTab = (tab: PreferenceTab) => {
  activeTab.value = tab
}

// 按标准标签页规则循环切换，并在视图更新后把焦点交给新标签。
const onTabKeydown = async (event: KeyboardEvent, currentTab: PreferenceTab) => {
  const currentIndex = preferenceTabs.indexOf(currentTab)
  let targetTab: PreferenceTab

  switch (event.key) {
    case 'ArrowLeft':
      targetTab = preferenceTabs[(currentIndex - 1 + preferenceTabs.length) % preferenceTabs.length]!
      break
    case 'ArrowRight':
      targetTab = preferenceTabs[(currentIndex + 1) % preferenceTabs.length]!
      break
    case 'Home':
      targetTab = preferenceTabs[0]
      break
    case 'End':
      targetTab = preferenceTabs[preferenceTabs.length - 1]!
      break
    default:
      return
  }

  event.preventDefault()
  selectTab(targetTab)
  await nextTick()
  tabButtons[targetTab].value?.focus()
}

const cancelLike = (dishId: string) => {
  preferences.toggleLike(dishId)
  menuStore.notify('已取消喜欢')
}

const restoreDish = (dishId: string) => {
  preferences.restore(dishId)
  menuStore.notify('已重新加入随机菜单')
}

const restoreBackup = (backup: AppBackupV1) => {
  menuStore.restoreBackup(backup)
}
</script>

<template>
  <main v-if="menuStore.menu" class="w-full px-3.5 pt-8 pb-10 sm:px-5">
    <header class="relative overflow-hidden rounded-[30px] border-[3px] border-ink bg-paper px-4 py-6 shadow-paper sm:px-5">
      <RouterLink
        class="mb-6 inline-flex min-h-11 items-center rounded-full border-2 border-forest/25 bg-white/70 px-3 text-xs font-bold text-forest-dark no-underline"
        to="/"
      >
        ← 回到今日菜单
      </RouterLink>
      <p class="m-0 text-xs font-bold tracking-[.14em] text-forest-dark">一家人的私人口味</p>
      <h1 class="mt-2 mb-0 font-display text-[clamp(2.75rem,14vw,4.5rem)] leading-none font-normal tracking-[-.05em] text-ink">家庭口味簿</h1>
      <p class="mt-4 mb-5 text-sm leading-6 font-semibold text-muted">
        喜欢的菜会更常出现，不喜欢的菜就留在这里，想吃时再把它请回来。
      </p>
      <div class="grid grid-cols-3 gap-2">
        <span class="min-w-0 rounded-xl border border-line/60 bg-white/65 px-1 py-3 text-center text-[10px] font-bold text-muted">
          <b class="block font-display text-2xl font-normal text-clay">{{ preferences.likedIds.length }}</b>
          喜欢
        </span>
        <span class="min-w-0 rounded-xl border border-line/60 bg-white/65 px-1 py-3 text-center text-[10px] font-bold text-muted">
          <b class="block font-display text-2xl font-normal text-clay">{{ preferences.dislikedIds.length }}</b>
          不喜欢
        </span>
        <span class="flex min-w-0 items-center justify-center rounded-xl border border-forest bg-forest px-1 py-3 text-center text-[10px] font-bold text-white">
          共记录 {{ preferences.preferenceCount }} 道菜
        </span>
      </div>
    </header>

    <section
      class="mt-7 rounded-[28px] border-[3px] border-ink bg-paper px-4 py-6 shadow-paper"
      aria-labelledby="preferences-book-title"
    >
      <div>
        <p class="m-0 text-xs font-bold tracking-wide text-forest-dark">翻开今天的记录</p>
        <h2 id="preferences-book-title" class="mt-1 mb-0 font-display text-[2rem] font-normal text-ink">喜欢 / 不喜欢</h2>
      </div>

      <div class="my-5 grid grid-cols-2 gap-2" role="tablist" aria-label="口味偏好分类">
        <button
          id="preferences-tab-liked"
          ref="likedTabButton"
          data-testid="liked-tab"
          role="tab"
          type="button"
          aria-controls="preferences-panel-liked"
          :aria-selected="activeTab === 'liked'"
          :tabindex="activeTab === 'liked' ? 0 : -1"
          :class="tabClass('liked')"
          @click="selectTab('liked')"
          @keydown="onTabKeydown($event, 'liked')"
        >
          喜欢的菜 <span class="ml-1 inline-grid size-5 place-items-center rounded-full bg-black/8 text-[10px]">{{ preferences.likedIds.length }}</span>
        </button>
        <button
          id="preferences-tab-disliked"
          ref="dislikedTabButton"
          data-testid="disliked-tab"
          role="tab"
          type="button"
          aria-controls="preferences-panel-disliked"
          :aria-selected="activeTab === 'disliked'"
          :tabindex="activeTab === 'disliked' ? 0 : -1"
          :class="tabClass('disliked')"
          @click="selectTab('disliked')"
          @keydown="onTabKeydown($event, 'disliked')"
        >
          不喜欢的菜 <span class="ml-1 inline-grid size-5 place-items-center rounded-full bg-black/8 text-[10px]">{{ preferences.dislikedIds.length }}</span>
        </button>
      </div>

      <div
        :id="`preferences-panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`preferences-tab-${activeTab}`"
      >
        <PreferenceDishList
          :dishes="visibleDishes"
          :mode="activeTab"
          @action="activeTab === 'liked' ? cancelLike($event) : restoreDish($event)"
        />
      </div>
    </section>

    <DataBackupPanel
      :menu="menuStore.menu"
      :preferences="{
        likedIds: preferences.likedIds,
        dislikedIds: preferences.dislikedIds,
      }"
      @before-export="menuStore.refreshDate()"
      @restore="restoreBackup"
    />

    <p class="mt-7 border-t border-line/70 pt-4 text-center font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
    <Footer type="tree" />
  </main>
</template>
