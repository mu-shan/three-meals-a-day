<script setup lang="ts">
import { Loading } from 'animal-island-vue'
import HomeHeader from '../components/HomeHeader.vue'
import MealCard from '../components/MealCard.vue'
import ShoppingList from '../components/ShoppingList.vue'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'

const menuStore = useMenuStore()
const preferences = usePreferencesStore()

menuStore.initialize()
</script>

<template>
  <main v-if="menuStore.menu" class="w-full">
    <HomeHeader :loading="menuStore.isShuffling" @generate="menuStore.generateAll" />

    <section class="relative px-4 pb-6 sm:px-5" aria-labelledby="menu-board-title" aria-live="polite">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="m-0 text-xs font-bold tracking-[.12em] text-forest-dark">今日餐桌 · 已经安排好啦</p>
          <h2 id="menu-board-title" class="mt-1 mb-0 font-display text-2xl text-ink">一家人的三顿饭</h2>
        </div>
        <div class="flex flex-wrap gap-2 text-[11px] font-semibold text-muted" aria-label="菜品标签说明">
          <span>宝宝友好</span><span>妈妈辣菜</span><span>全家共享</span>
        </div>
      </div>

      <div
        class="grid gap-4"
        :class="{ 'opacity-55': menuStore.isShuffling }"
      >
        <MealCard
          :meal="menuStore.menu.breakfast"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          @reroll="menuStore.rerollMeal('breakfast')"
          @replace="menuStore.rerollDish('breakfast', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('breakfast', $event)"
        />
        <MealCard
          :meal="menuStore.menu.lunch"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          @reroll="menuStore.rerollMeal('lunch')"
          @replace="menuStore.rerollDish('lunch', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('lunch', $event)"
        />
        <MealCard
          :meal="menuStore.menu.dinner"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          @reroll="menuStore.rerollMeal('dinner')"
          @replace="menuStore.rerollDish('dinner', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('dinner', $event)"
        />
      </div>

      <div v-if="menuStore.isShuffling" class="absolute inset-0 grid place-items-center bg-paper/40 backdrop-blur-[1px]" role="status">
        <Loading :active="true" />
        <p>正在给餐桌换新菜…</p>
      </div>
    </section>

    <ShoppingList :list="menuStore.shoppingList" />

    <footer class="mx-4 mb-4 border-t border-line/70 px-1 pt-4 text-center text-xs leading-6 text-muted sm:mx-5">
      <p class="m-0 font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
      <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
    </footer>
  </main>
</template>
