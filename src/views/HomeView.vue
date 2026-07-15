<script setup lang="ts">
import { Footer } from 'animal-island-vue'
import HomeHeader from '../components/HomeHeader.vue'
import MealCard from '../components/MealCard.vue'
import ShoppingList from '../components/ShoppingList.vue'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'
import { dishRoleMeta } from '../ui/dishRoleMeta'

const menuStore = useMenuStore()
const preferences = usePreferencesStore()
const legendRoles = ['baby', 'spicy', 'shared'] as const

menuStore.initialize()
</script>

<template>
  <main v-if="menuStore.menu" class="w-full">
    <HomeHeader :disabled="menuStore.isShuffling" @generate="menuStore.generateAll" />

    <section
      class="mx-3 rounded-3xl border border-line/75 bg-paper/90 p-3 shadow-paper sm:mx-4 sm:p-4"
      aria-labelledby="menu-board-title"
      aria-live="polite"
    >
      <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="m-0 text-xs font-bold tracking-[.12em] text-forest-dark">
            今日餐桌 · 已经安排好啦
          </p>
          <h2 id="menu-board-title" class="mt-1 mb-0 font-display text-2xl text-ink">
            一家人的三顿饭
          </h2>
        </div>

        <div
          class="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-semibold text-muted"
          aria-label="菜品标签说明"
        >
          <span
            v-for="role in legendRoles"
            :key="role"
            class="inline-flex items-center gap-1.5"
          >
            <span
              :class="['size-2.5 rounded-full', dishRoleMeta[role].legendClass]"
              aria-hidden="true"
            ></span>
            {{ dishRoleMeta[role].label }}
          </span>
        </div>
      </div>

      <div class="grid gap-4">
        <MealCard
          :meal="menuStore.menu.breakfast"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          :loading="
            menuStore.shuffleTarget?.scope === 'meal' &&
            menuStore.shuffleTarget.mealType === 'breakfast'
          "
          :shuffling-dish-id="
            menuStore.shuffleTarget?.scope === 'dish' &&
            menuStore.shuffleTarget.mealType === 'breakfast'
              ? menuStore.shuffleTarget.dishId
              : null
          "
          @reroll="menuStore.rerollMeal('breakfast')"
          @replace="menuStore.rerollDish('breakfast', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('breakfast', $event)"
        />
        <MealCard
          :meal="menuStore.menu.lunch"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          :loading="
            menuStore.shuffleTarget?.scope === 'meal' &&
            menuStore.shuffleTarget.mealType === 'lunch'
          "
          :shuffling-dish-id="
            menuStore.shuffleTarget?.scope === 'dish' &&
            menuStore.shuffleTarget.mealType === 'lunch'
              ? menuStore.shuffleTarget.dishId
              : null
          "
          @reroll="menuStore.rerollMeal('lunch')"
          @replace="menuStore.rerollDish('lunch', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('lunch', $event)"
        />
        <MealCard
          :meal="menuStore.menu.dinner"
          :liked-ids="preferences.rules.likedIds"
          :disabled="menuStore.isShuffling"
          :loading="
            menuStore.shuffleTarget?.scope === 'meal' &&
            menuStore.shuffleTarget.mealType === 'dinner'
          "
          :shuffling-dish-id="
            menuStore.shuffleTarget?.scope === 'dish' &&
            menuStore.shuffleTarget.mealType === 'dinner'
              ? menuStore.shuffleTarget.dishId
              : null
          "
          @reroll="menuStore.rerollMeal('dinner')"
          @replace="menuStore.rerollDish('dinner', $event)"
          @like="menuStore.toggleLike"
          @dislike="menuStore.dislikeDish('dinner', $event)"
        />
      </div>
    </section>

    <ShoppingList :list="menuStore.shoppingList" />

    <footer class="mx-4 mt-7 border-t border-line/70 px-1 pt-4 text-center text-xs leading-6 text-muted sm:mx-5">
      <p class="m-0 font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
      <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
    </footer>
    <Footer type="tree" />
  </main>
</template>
