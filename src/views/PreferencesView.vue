<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
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

const cancelLike = (dishId: string) => {
  preferences.toggleLike(dishId)
  menuStore.notify('已取消喜欢')
}

const restoreDish = (dishId: string) => {
  preferences.restore(dishId)
  menuStore.notify('已重新加入随机菜单')
}

const restoreBackup = (backup: AppBackupV1) => {
  preferences.replacePreferences(backup.preferences)
  if (backup.menu.date === menuStore.today) {
    menuStore.replaceImportedMenu(backup.menu)
  } else {
    menuStore.regenerateToday()
  }
  menuStore.notify('备份已恢复')
}
</script>

<template>
  <main v-if="menuStore.menu" class="preferences-view">
    <header class="preferences-hero">
      <RouterLink class="preferences-hero__back" to="/">← 回到今日菜单</RouterLink>
      <p>一家人的私人口味</p>
      <h1>家庭口味簿</h1>
      <p class="preferences-hero__lead">
        喜欢的菜会更常出现，不喜欢的菜就留在这里，想吃时再把它请回来。
      </p>
      <div class="preferences-hero__stats">
        <span><b>{{ preferences.likedIds.length }}</b> 喜欢</span>
        <span><b>{{ preferences.dislikedIds.length }}</b> 不喜欢</span>
        <span>共记录 {{ preferences.preferenceCount }} 道菜</span>
      </div>
    </header>

    <section class="preferences-book" aria-labelledby="preferences-book-title">
      <div class="preferences-book__heading">
        <p>翻开今天的记录</p>
        <h2 id="preferences-book-title">喜欢 / 不喜欢</h2>
      </div>

      <div class="preferences-book__tabs" role="tablist" aria-label="口味偏好分类">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'liked'"
          :class="{ 'is-active': activeTab === 'liked' }"
          @click="activeTab = 'liked'"
        >
          喜欢的菜 <span>{{ preferences.likedIds.length }}</span>
        </button>
        <button
          data-testid="disliked-tab"
          type="button"
          role="tab"
          :aria-selected="activeTab === 'disliked'"
          :class="{ 'is-active': activeTab === 'disliked' }"
          @click="activeTab = 'disliked'"
        >
          不喜欢的菜 <span>{{ preferences.dislikedIds.length }}</span>
        </button>
      </div>

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
      @restore="restoreBackup"
    />
  </main>
</template>
