<script setup lang="ts">
import AppFooter from '../components/AppFooter.vue'
import CardCornerDecoration from '../components/CardCornerDecoration.vue'
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
    <HomeHeader :disabled="menuStore.isShuffling" @generate="menuStore.generateAll" />

    <section
      class="relative mx-3 overflow-hidden rounded-3xl border border-line/75 bg-paper/90 p-3 shadow-paper sm:mx-4 sm:p-4"
      aria-labelledby="menu-board-title"
      aria-live="polite"
    >
      <CardCornerDecoration variant="meal" />

      <div class="relative z-10 mb-4 pr-20 sm:pr-24">
        <div>
          <p class="m-0 text-xs font-bold tracking-[.12em] text-forest-dark">
            今日餐桌 · 已经安排好啦
          </p>
          <h2 id="menu-board-title" class="mt-1 mb-0 font-display text-2xl text-ink">
            一家人的三顿饭
          </h2>
        </div>

      </div>

      <div class="relative z-10 grid gap-4">
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

    <AppFooter show-description />
  </main>
</template>
