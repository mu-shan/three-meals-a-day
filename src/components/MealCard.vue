<script setup lang="ts">
import { Button, Card } from 'animal-island-vue'
import type { Meal } from '../types/menu'
import DishCard from './DishCard.vue'

const props = withDefaults(
  defineProps<{
    meal: Meal
    featured?: boolean
    likedIds?: ReadonlySet<string>
    disabled?: boolean
  }>(),
  { featured: false, likedIds: () => new Set<string>(), disabled: false },
)

const emit = defineEmits<{
  reroll: []
  replace: [dishId: string]
  like: [dishId: string]
  dislike: [dishId: string]
}>()

const mealMeta = {
  breakfast: { title: '早餐', time: '07:30', kicker: '元气开场', color: 'app-yellow' as const },
  lunch: { title: '午餐', time: '12:00', kicker: '全家主场', color: 'app-green' as const },
  dinner: { title: '晚餐', time: '18:30', kicker: '轻松收尾', color: 'app-orange' as const },
}
</script>

<template>
  <section class="meal-card" :class="{ 'meal-card--featured': featured }">
    <Card :color="mealMeta[props.meal.type].color" pattern="none">
      <div class="meal-card__header">
        <div>
          <p>{{ mealMeta[props.meal.type].kicker }} · {{ mealMeta[props.meal.type].time }}</p>
          <h2>{{ mealMeta[props.meal.type].title }}</h2>
        </div>
        <Button
          data-testid="reroll-meal"
          class="meal-card__reroll"
          type="default"
          size="small"
          :disabled="disabled"
          @click="emit('reroll')"
        >
          <span class="meal-card__reroll-label">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7L20 8M20 3v5h-5" />
            </svg>
            换一桌
          </span>
        </Button>
      </div>

      <div class="meal-card__dishes">
        <DishCard
          v-for="dish in meal.dishes"
          :key="dish.id"
          :dish="dish"
          :liked="likedIds.has(dish.id)"
          :disabled="disabled"
          @replace="emit('replace', $event)"
          @like="emit('like', $event)"
          @dislike="emit('dislike', $event)"
        />
      </div>
    </Card>
  </section>
</template>
