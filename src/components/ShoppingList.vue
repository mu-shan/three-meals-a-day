<script setup lang="ts">
import type { IngredientCategory, ShoppingListData } from '../types/menu'

defineProps<{ list: ShoppingListData }>()

const categoryMeta: Record<IngredientCategory, { label: string; color: string }> = {
  vegetables: { label: '蔬菜篮', color: 'green' },
  protein: { label: '肉蛋奶', color: 'red' },
  staples: { label: '主食柜', color: 'yellow' },
  fruit: { label: '水果摊', color: 'orange' },
}

const categories = Object.keys(categoryMeta) as IngredientCategory[]
</script>

<template>
  <section class="shopping-list" aria-labelledby="shopping-list-title">
    <div class="shopping-list__heading">
      <div>
        <p>照着买，不漏样</p>
        <h2 id="shopping-list-title">今日采购清单</h2>
      </div>
      <span>{{ Object.values(list).reduce((total, items) => total + items.length, 0) }} 样食材</span>
    </div>

    <div class="shopping-list__grid">
      <article
        v-for="category in categories.filter((item) => list[item].length > 0)"
        :key="category"
        class="shopping-list__group"
        :class="`shopping-list__group--${categoryMeta[category].color}`"
      >
        <h3>{{ categoryMeta[category].label }}</h3>
        <ul>
          <li v-for="item in list[category]" :key="item">
            <span />{{ item }}
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
