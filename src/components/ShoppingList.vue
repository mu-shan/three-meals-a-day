<script setup lang="ts">
import { Collapse, Icon } from 'animal-island-vue'
import { computed } from 'vue'
import type { IngredientCategory, MealType, ShoppingListData } from '../types/menu'
import CardCornerDecoration from './CardCornerDecoration.vue'

const props = defineProps<{ list: ShoppingListData }>()

const categoryMeta: Record<IngredientCategory, { label: string; color: string }> = {
  vegetables: { label: '蔬菜篮', color: 'green' },
  protein: { label: '肉蛋奶', color: 'red' },
  staples: { label: '主食柜', color: 'yellow' },
  fruit: { label: '水果摊', color: 'orange' },
}

const categories = Object.keys(categoryMeta) as IngredientCategory[]
const visibleCategories = computed(() => categories.filter((category) => props.list[category].length))
const mealTypeMeta: Record<MealType, { label: string; shortLabel: string; class: string }> = {
  breakfast: { label: '早餐', shortLabel: '早', class: 'bg-sand/70 text-ink' },
  lunch: { label: '午餐', shortLabel: '午', class: 'bg-shared-soft text-shared-deep' },
  dinner: { label: '晚餐', shortLabel: '晚', class: 'bg-spicy-soft text-spicy-deep' },
}
</script>

<template>
  <section class="relative mx-4 mt-6 mb-6 overflow-hidden rounded-2xl bg-forest p-4 text-paper shadow-paper sm:mx-5" aria-labelledby="shopping-list-title">
    <CardCornerDecoration variant="shopping" />

    <div class="relative z-10 flex items-center gap-3 pr-20 sm:pr-24">
      <Icon name="icon-shopping" :size="34" />
      <div>
        <p class="m-0 text-xs font-bold tracking-wide text-paper/75">照着买，不漏样</p>
        <h2 id="shopping-list-title" class="mt-1 mb-0 font-display text-2xl text-paper">今日采购清单</h2>
      </div>
    </div>

    <div class="relative z-10 mt-4 grid gap-2">
      <Collapse
        v-for="(category, index) in visibleCategories"
        :key="category"
        class="rounded-xl bg-paper/12 px-3 py-1 text-paper"
        :default-expanded="index === 0"
      >
        <template #question>
          <span class="inline-flex items-baseline">
            <span>{{ categoryMeta[category].label }}</span>
            <b class="mx-1.5">{{ list[category].length }}</b>
            <span>样</span>
          </span>
        </template>
        <ul>
          <li
            v-for="item in list[category]"
            :key="item.name"
            :data-testid="`shopping-item-${item.name}`"
            class="flex min-w-0 items-center gap-2"
          >
            <span />
            <b class="min-w-0 flex-1 truncate font-normal">{{ item.name }}</b>
            <div class="flex shrink-0 flex-wrap justify-end gap-1">
              <small
                v-for="mealType in item.mealTypes"
                :key="mealType"
                :data-meal-type="mealType"
                :aria-label="mealTypeMeta[mealType].label"
                :class="[
                  'inline-grid size-5 place-items-center rounded-full text-[10px] font-bold not-italic',
                  mealTypeMeta[mealType].class,
                ]"
              >
                {{ mealTypeMeta[mealType].shortLabel }}
              </small>
            </div>
          </li>
        </ul>
      </Collapse>
    </div>
  </section>
</template>
