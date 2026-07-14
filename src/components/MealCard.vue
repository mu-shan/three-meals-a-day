<script setup lang="ts">
import { Button, Card, Divider, Title } from 'animal-island-vue'
import type { Meal } from '../types/menu'
import DishCard from './DishCard.vue'

const props = withDefaults(
  defineProps<{
    meal: Meal
    likedIds?: ReadonlySet<string>
    disabled?: boolean
  }>(),
  { likedIds: () => new Set<string>(), disabled: false },
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
  <section class="rounded-2xl border border-line/70 bg-paper/90 p-4 shadow-paper">
    <Card :color="mealMeta[props.meal.type].color" pattern="none">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="m-0 text-xs font-bold tracking-wide text-muted">{{ mealMeta[props.meal.type].kicker }} · {{ mealMeta[props.meal.type].time }}</p>
          <Title class="mt-1 block font-display text-2xl text-ink" size="middle" :color="mealMeta[props.meal.type].color">
            {{ mealMeta[props.meal.type].title }}
          </Title>
        </div>
        <Button
          data-testid="reroll-meal"
          class="min-h-11 shrink-0 rounded-xl! border-line! bg-paper-soft! text-ink!"
          type="default"
          size="small"
          :disabled="disabled"
          @click="emit('reroll')"
        >
          <span class="flex items-center gap-1">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.3-5.7L20 8M20 3v5h-5" />
            </svg>
            换一餐
          </span>
        </Button>
      </div>

      <Divider type="dashed-brown" />

      <div class="grid gap-3">
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
