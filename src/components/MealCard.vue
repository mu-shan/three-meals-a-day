<script setup lang="ts">
import { Button, Title } from 'animal-island-vue'
import type { Meal } from '../types/menu'
import { dishRoleMeta } from '../ui/dishRoleMeta'
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
const lunchLegendRoles = ['baby', 'spicy'] as const
</script>

<template>
  <section
    class="rounded-2xl border border-line/75 bg-paper/95 p-3 shadow-paper sm:p-4"
    :aria-labelledby="`meal-${meal.type}-title`"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="m-0 text-xs font-bold tracking-wide text-muted">
          {{ mealMeta[props.meal.type].kicker }} · {{ mealMeta[props.meal.type].time }}
        </p>
        <h3 :id="`meal-${meal.type}-title`" class="m-0">
          <Title
            class="mt-1 block font-display text-2xl text-ink"
            size="middle"
            :color="mealMeta[props.meal.type].color"
          >
            {{ mealMeta[props.meal.type].title }}
          </Title>
        </h3>
      </div>

      <div data-testid="meal-controls" class="flex shrink-0 flex-col items-end gap-2">
        <Button
          data-testid="reroll-meal"
          class="min-h-11 w-auto! rounded-xl! border-line! bg-paper-soft! px-3! text-sm! text-ink!"
          type="default"
          size="small"
          :loading="props.loading"
          :disabled="props.disabled"
          :aria-busy="props.loading"
        @click="emit('reroll')"
      >
          <span class="inline-flex items-center gap-1.5">
            <svg
              data-icon="reroll-meal"
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12a8 8 0 1 1-2.3-5.7L20 8M20 3v5h-5" />
            </svg>
            换一桌
          </span>
        </Button>

        <div
          v-if="meal.type === 'lunch'"
          data-testid="meal-role-legend"
          class="flex flex-wrap justify-end gap-x-3 gap-y-1.5 text-[11px] font-semibold text-muted max-[380px]:gap-x-2 max-[380px]:text-[10px]"
          aria-label="午餐菜品标签说明"
        >
          <span
            v-for="role in lunchLegendRoles"
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
    </div>

    <div class="mt-4 grid gap-3">
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
