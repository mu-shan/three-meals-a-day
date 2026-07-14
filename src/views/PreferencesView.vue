<script setup lang="ts">
import { Divider, Footer, Tabs, Title } from 'animal-island-vue'
import { computed, ref } from 'vue'
import DataBackupPanel from '../components/DataBackupPanel.vue'
import PreferenceDishList from '../components/PreferenceDishList.vue'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'
import type { AppBackupV1 } from '../types/menu'

const activeTab = ref<'liked' | 'disliked'>('liked')
const preferences = usePreferencesStore()
const menuStore = useMenuStore()

menuStore.initialize()

const visibleDishes = computed(() =>
  activeTab.value === 'liked' ? preferences.likedDishes : preferences.dislikedDishes,
)

const preferenceTabs = computed(() => [
  { key: 'liked', label: `喜欢的菜 ${preferences.likedIds.length}` },
  { key: 'disliked', label: `不喜欢的菜 ${preferences.dislikedIds.length}` },
])

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
  <main v-if="menuStore.menu" class="px-4 pt-7 pb-6 sm:px-5">
    <header>
      <p class="m-0 text-xs font-bold tracking-[.14em] text-forest-dark">一家人的私人口味</p>
      <Title class="mt-2 block font-display text-[2.4rem] leading-none text-ink" size="large" color="brown">家庭口味簿</Title>
      <Divider type="wave-yellow" />
      <p class="mt-3 mb-4 text-sm leading-6 text-muted">喜欢的菜会更常出现，不喜欢的菜就留在这里，想吃时再把它请回来。</p>
      <div class="grid grid-cols-3 gap-2">
        <span class="rounded-xl border border-line/60 bg-paper/80 px-2 py-3 text-center text-xs text-muted"><b class="block font-display text-2xl text-clay">{{ preferences.likedIds.length }}</b>喜欢</span>
        <span class="rounded-xl border border-line/60 bg-paper/80 px-2 py-3 text-center text-xs text-muted"><b class="block font-display text-2xl text-clay">{{ preferences.dislikedIds.length }}</b>不喜欢</span>
        <span class="rounded-xl border border-line/60 bg-paper/80 px-2 py-3 text-center text-xs text-muted"><b class="block font-display text-2xl text-clay">{{ preferences.preferenceCount }}</b>共记录 {{ preferences.preferenceCount }} 道菜</span>
      </div>
    </header>

    <section class="mt-6" aria-labelledby="preferences-book-title">
      <div>
        <p class="m-0 text-xs font-bold tracking-wide text-forest-dark">翻开今天的记录</p>
        <Title id="preferences-book-title" class="mt-1 block font-display text-2xl text-ink" size="middle" color="brown">喜欢 / 不喜欢</Title>
      </div>

      <Tabs v-model="activeTab" :items="preferenceTabs" leaf-animation shadow />

      <PreferenceDishList
        :dishes="visibleDishes"
        :mode="activeTab"
        @action="activeTab === 'liked' ? cancelLike($event) : restoreDish($event)"
      />
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
