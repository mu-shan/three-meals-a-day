<script setup lang="ts">
import type { Dish } from '../types/menu'

const props = defineProps<{
  dishes: Dish[]
  mode: 'liked' | 'disliked'
}>()

const emit = defineEmits<{
  action: [dishId: string]
}>()

const preferenceOwner = (dish: Dish) => {
  if (dish.role === 'baby') return '宝宝的口味'
  if (dish.role === 'spicy') return '妈妈的口味'
  return '全家的口味'
}
</script>

<template>
  <div v-if="dishes.length" class="preference-list">
    <article v-for="dish in dishes" :key="dish.id" class="preference-list__item">
      <div class="preference-list__image">
        <img :src="dish.image" :alt="dish.name" />
      </div>
      <div class="preference-list__copy">
        <span>{{ preferenceOwner(dish) }}</span>
        <h3>{{ dish.name }}</h3>
        <p>{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
      </div>
      <button
        :data-testid="mode === 'liked' ? 'cancel-like' : 'restore-dish'"
        class="preference-list__action"
        :class="{ 'preference-list__action--restore': mode === 'disliked' }"
        type="button"
        @click="emit('action', dish.id)"
      >
        {{ mode === 'liked' ? '取消喜欢' : '重新加入' }}
      </button>
    </article>
  </div>

  <div v-else class="preference-list__empty">
    <span aria-hidden="true">{{ mode === 'liked' ? '♡' : '✓' }}</span>
    <h3>{{ mode === 'liked' ? '还没有喜欢的菜' : '没有不喜欢的菜' }}</h3>
    <p v-if="mode === 'liked'">回到今日菜单点“喜欢”，它下次出现的机会会翻倍。</p>
    <p v-else>遇到不合口味的菜直接标记，之后随机时会自动避开。</p>
  </div>
</template>
