<script setup lang="ts">
import { Loading } from 'animal-island-vue'
import { useRouter } from 'vue-router'
import FamilyHero from '../components/FamilyHero.vue'
import MealCard from '../components/MealCard.vue'
import ShoppingList from '../components/ShoppingList.vue'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'

const router = useRouter()
const menuStore = useMenuStore()
const preferences = usePreferencesStore()

menuStore.initialize()
</script>

<template>
  <main v-if="menuStore.menu" class="home-view">
    <FamilyHero
      :date="new Date()"
      :loading="menuStore.isShuffling"
      :preference-count="preferences.preferenceCount"
      @generate="menuStore.generateAll"
      @open-preferences="router.push('/preferences')"
    />

    <section class="menu-board" aria-labelledby="menu-board-title" aria-live="polite">
      <div class="menu-board__heading">
        <div>
          <p>今日餐桌 · 已经安排好啦</p>
          <h2 id="menu-board-title">一家人的三顿饭</h2>
        </div>
        <div class="menu-board__legend" aria-label="菜品标签说明">
          <span><i class="legend-dot legend-dot--baby" />宝宝友好</span>
          <span><i class="legend-dot legend-dot--spicy" />妈妈辣菜</span>
          <span><i class="legend-dot legend-dot--shared" />全家共享</span>
        </div>
      </div>

      <div
        class="meal-grid"
        :class="{ 'meal-grid--shuffling': menuStore.isShuffling }"
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
          featured
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

      <div v-if="menuStore.isShuffling" class="shuffle-overlay" role="status">
        <Loading :active="true" />
        <p>正在给餐桌换新菜…</p>
      </div>
    </section>

    <ShoppingList :list="menuStore.shoppingList" />

    <footer class="page-footer">
      <p>今天也要和喜欢的人，好好吃饭。</p>
      <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
    </footer>
  </main>
</template>
