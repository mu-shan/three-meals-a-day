<script setup lang="ts">
import { computed, ref } from 'vue'
import { Loading } from 'animal-island-vue'
import DishPreferenceDrawer from './components/DishPreferenceDrawer.vue'
import FamilyHero from './components/FamilyHero.vue'
import MealCard from './components/MealCard.vue'
import ShoppingList from './components/ShoppingList.vue'
import { useDishPreferences } from './composables/useDishPreferences'
import { dishes } from './data/dishes'
import {
  generateBreakfast,
  generateDailyMenu,
  generateDinner,
  generateLunch,
  reconcileDailyMenu,
  replaceDish,
} from './domain/menuGenerator'
import { buildShoppingList } from './domain/shoppingList'
import {
  formatLocalDate,
  loadTodayMenu,
  saveTodayMenu,
} from './services/todayMenuStorage'
import type { DailyMenu, Dish, MealType } from './types/menu'

const now = new Date()
const today = formatLocalDate(now)
const validDishIds = new Set(dishes.map((dish) => dish.id))
const preferences = useDishPreferences(window.localStorage, validDishIds)
const storedMenu = loadTodayMenu(window.localStorage, today)
let initialFeedback = ''
const createInitialMenu = () => {
  try {
    return storedMenu
      ? reconcileDailyMenu(storedMenu, preferences.rules.value)
      : generateDailyMenu(today, preferences.rules.value)
  } catch {
    for (const dishId of [...preferences.dislikedIds.value]) {
      preferences.restore(dishId)
    }
    initialFeedback = '不喜欢的菜太多，已恢复候选以保证菜单可用'
    return generateDailyMenu(today, preferences.rules.value)
  }
}
const menu = ref<DailyMenu>(createInitialMenu())
const isShuffling = ref(false)
const preferencesOpen = ref(false)
const feedback = ref('')
let feedbackTimer: number | undefined

saveTodayMenu(window.localStorage, menu.value)

const shoppingList = computed(() => buildShoppingList(menu.value))
const likedDishes = computed(() =>
  preferences.likedIds.value
    .map((id) => dishes.find((dish) => dish.id === id))
    .filter((dish): dish is Dish => Boolean(dish)),
)
const dislikedDishes = computed(() =>
  preferences.dislikedIds.value
    .map((id) => dishes.find((dish) => dish.id === id))
    .filter((dish): dish is Dish => Boolean(dish)),
)
const preferenceCount = computed(
  () => likedDishes.value.length + dislikedDishes.value.length,
)

const showFeedback = (message: string) => {
  feedback.value = message
  window.clearTimeout(feedbackTimer)
  feedbackTimer = window.setTimeout(() => {
    feedback.value = ''
  }, 2200)
}

if (initialFeedback) showFeedback(initialFeedback)

const persist = (nextMenu: DailyMenu) => {
  menu.value = nextMenu
  saveTodayMenu(window.localStorage, nextMenu)
}

const shuffle = (createMenu: () => DailyMenu) => {
  if (isShuffling.value) return
  isShuffling.value = true

  window.setTimeout(() => {
    try {
      persist(createMenu())
    } catch {
      showFeedback('当前偏好下没有足够候选，请恢复一些不喜欢的菜')
    } finally {
      isShuffling.value = false
    }
  }, 420)
}

const generateAll = () => {
  shuffle(() => generateDailyMenu(today, preferences.rules.value))
}

const rerollMeal = (type: MealType) => {
  shuffle(() => {
    const otherIds = new Set(
      (['breakfast', 'lunch', 'dinner'] as MealType[])
        .filter((mealType) => mealType !== type)
        .flatMap((mealType) => menu.value[mealType].dishes.map((dish) => dish.id)),
    )

    const nextMeal =
      type === 'breakfast'
        ? generateBreakfast(otherIds, preferences.rules.value)
        : type === 'lunch'
          ? generateLunch({ excludedIds: otherIds, preferences: preferences.rules.value })
          : generateDinner(otherIds, preferences.rules.value)

    return { ...menu.value, [type]: nextMeal }
  })
}

const rerollDish = (type: MealType, dishId: string) => {
  shuffle(() => ({
    ...menu.value,
    [type]: replaceDish(menu.value[type], dishId, preferences.rules.value),
  }))
}

const toggleLike = (dishId: string) => {
  const wasLiked = preferences.isLiked(dishId)
  preferences.toggleLike(dishId)
  showFeedback(wasLiked ? '已取消喜欢' : '已加入喜欢，下次出现概率翻倍')
}

const dislikeDish = (type: MealType, dishId: string) => {
  if (isShuffling.value) return

  const nextRules = {
    likedIds: new Set([...preferences.rules.value.likedIds].filter((id) => id !== dishId)),
    dislikedIds: new Set([...preferences.rules.value.dislikedIds, dishId]),
  }
  const nextMeal = replaceDish(menu.value[type], dishId, nextRules)

  if (nextMeal === menu.value[type]) {
    showFeedback('这类菜至少要保留一道，暂时不能移除')
    return
  }

  preferences.dislike(dishId)
  showFeedback('已记入不喜欢，并为你换了一道')
  shuffle(() => ({ ...menu.value, [type]: nextMeal }))
}

const restoreDish = (dishId: string) => {
  preferences.restore(dishId)
  showFeedback('已重新加入随机菜单')
}

const cancelLike = (dishId: string) => {
  preferences.toggleLike(dishId)
  showFeedback('已取消喜欢')
}
</script>

<template>
  <div class="app-shell">
    <div class="top-ribbon" aria-hidden="true">
      <span>一家三口</span>
      <span>好好吃饭</span>
      <span>今日份幸福</span>
    </div>

    <main>
      <FamilyHero
        :date="now"
        :loading="isShuffling"
        :preference-count="preferenceCount"
        @generate="generateAll"
        @open-preferences="preferencesOpen = true"
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

        <div class="meal-grid" :class="{ 'meal-grid--shuffling': isShuffling }">
          <MealCard
            :meal="menu.breakfast"
            :liked-ids="preferences.rules.value.likedIds"
            :disabled="isShuffling"
            @reroll="rerollMeal('breakfast')"
            @replace="rerollDish('breakfast', $event)"
            @like="toggleLike"
            @dislike="dislikeDish('breakfast', $event)"
          />
          <MealCard
            :meal="menu.lunch"
            :liked-ids="preferences.rules.value.likedIds"
            :disabled="isShuffling"
            featured
            @reroll="rerollMeal('lunch')"
            @replace="rerollDish('lunch', $event)"
            @like="toggleLike"
            @dislike="dislikeDish('lunch', $event)"
          />
          <MealCard
            :meal="menu.dinner"
            :liked-ids="preferences.rules.value.likedIds"
            :disabled="isShuffling"
            @reroll="rerollMeal('dinner')"
            @replace="rerollDish('dinner', $event)"
            @like="toggleLike"
            @dislike="dislikeDish('dinner', $event)"
          />
        </div>

        <div v-if="isShuffling" class="shuffle-overlay" role="status">
          <Loading :active="true" />
          <p>正在给餐桌换新菜…</p>
        </div>
      </section>

      <ShoppingList :list="shoppingList" />
    </main>

    <footer class="page-footer">
      <p>今天也要和喜欢的人，好好吃饭。</p>
      <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
    </footer>

    <DishPreferenceDrawer
      :open="preferencesOpen"
      :liked-dishes="likedDishes"
      :disliked-dishes="dislikedDishes"
      @close="preferencesOpen = false"
      @cancel-like="cancelLike"
      @restore="restoreDish"
    />

    <Transition name="preference-toast">
      <div v-if="feedback" class="preference-toast" role="status">
        <span aria-hidden="true">✓</span>
        {{ feedback }}
      </div>
    </Transition>
  </div>
</template>
