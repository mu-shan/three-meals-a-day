<script setup lang="ts">
import { Button, Divider, Title } from 'animal-island-vue'
import type { Meal } from '../types/menu'
import DishCard from './DishCard.vue'

const props = withDefaults(
  defineProps<{
    meal: Meal
    likedIds?: ReadonlySet<string>
    disabled?: boolean
    loading?: boolean
    shufflingDishId?: string | null
  }>(),
  {
    likedIds: () => new Set<string>(),
    disabled: false,
    loading: false,
    shufflingDishId: null,
  },
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
  <section class="rounded-2xl border border-line/75 bg-paper/95 p-3 shadow-paper sm:p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="m-0 text-xs font-bold tracking-wide text-muted">
          {{ mealMeta[props.meal.type].kicker }} · {{ mealMeta[props.meal.type].time }}
        </p>
        <Title
          class="mt-1 block font-display text-2xl text-ink"
          size="middle"
          :color="mealMeta[props.meal.type].color"
        >
          {{ mealMeta[props.meal.type].title }}
        </Title>
      </div>

      <Button
        data-testid="reroll-meal"
        class="min-h-11 shrink-0 rounded-xl! border-line! bg-paper-soft! px-3! text-sm! text-ink!"
        type="default"
        size="small"
        :loading="props.loading"
        :disabled="props.disabled"
        :aria-busy="props.loading"
        @click="emit('reroll')"
      >
        ↻ 换一餐
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
        :loading="shufflingDishId === dish.id"
        @replace="emit('replace', $event)"
        @like="emit('like', $event)"
        @dislike="emit('dislike', $event)"
      />
    </div>
  </section>
</template>
