<script setup lang="ts">
import { Collapse, Divider, Icon, Title } from 'animal-island-vue'
import { computed } from 'vue'
import type { IngredientCategory, ShoppingListData } from '../types/menu'

const props = defineProps<{ list: ShoppingListData }>()

const categoryMeta: Record<IngredientCategory, { label: string; color: string }> = {
  vegetables: { label: '蔬菜篮', color: 'green' },
  protein: { label: '肉蛋奶', color: 'red' },
  staples: { label: '主食柜', color: 'yellow' },
  fruit: { label: '水果摊', color: 'orange' },
}

const categories = Object.keys(categoryMeta) as IngredientCategory[]
const visibleCategories = computed(() => categories.filter((category) => props.list[category].length))
</script>

<template>
  <section class="mx-4 mb-6 rounded-2xl bg-forest p-4 text-paper shadow-paper sm:mx-5" aria-labelledby="shopping-list-title">
    <div class="flex items-center gap-3">
      <Icon name="icon-shopping" :size="34" />
      <div>
        <p class="m-0 text-xs font-bold tracking-wide text-paper/75">照着买，不漏样</p>
        <Title id="shopping-list-title" class="mt-1 block font-display text-2xl text-paper" size="middle" color="app-green">今日采购清单</Title>
      </div>
    </div>

    <Divider type="wave-yellow" />

    <div class="grid gap-2">
      <Collapse
        v-for="(category, index) in visibleCategories"
        :key="category"
        class="rounded-xl bg-paper/12 px-3 py-1 text-paper"
        :default-expanded="index === 0"
      >
        <template #question>
          <span>{{ categoryMeta[category].label }}</span>
          <b>{{ list[category].length }} 样</b>
        </template>
        <ul>
          <li v-for="item in list[category]" :key="item">
            <span />{{ item }}
          </li>
        </ul>
      </Collapse>
    </div>
  </section>
</template>
