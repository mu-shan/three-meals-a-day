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
  <main v-if="menuStore.menu" class="preferences-view">
    <header class="preferences-header">
      <p>一家人的私人口味</p>
      <Title size="large" color="brown">家庭口味簿</Title>
      <Divider type="wave-yellow" />
      <p class="preferences-header__lead">喜欢的菜会更常出现，不喜欢的菜就留在这里，想吃时再把它请回来。</p>
      <div class="preferences-header__stats">
        <span><b>{{ preferences.likedIds.length }}</b> 喜欢</span>
        <span><b>{{ preferences.dislikedIds.length }}</b> 不喜欢</span>
        <span>共记录 {{ preferences.preferenceCount }} 道菜</span>
      </div>
    </header>

    <section class="preferences-book" aria-labelledby="preferences-book-title">
      <div class="preferences-book__heading">
        <p>翻开今天的记录</p>
        <Title id="preferences-book-title" size="middle" color="brown">喜欢 / 不喜欢</Title>
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

    <p class="page-signoff">今天也要和喜欢的人，好好吃饭。</p>
    <Footer type="tree" />
  </main>
</template>
