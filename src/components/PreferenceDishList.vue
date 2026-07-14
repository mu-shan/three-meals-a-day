<script setup lang="ts">
import { Button, Card } from 'animal-island-vue'
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
  <div v-if="dishes.length" class="mt-4 grid gap-3">
    <Card v-for="dish in dishes" :key="dish.id" color="default" pattern="none">
      <article class="flex items-center gap-3 p-3">
        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand/45">
          <img class="h-full w-full object-cover" :src="dish.image" :alt="dish.name" />
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold text-forest-dark">{{ preferenceOwner(dish) }}</span>
          <h3 class="mt-0.5 mb-0 truncate font-display text-lg text-ink">{{ dish.name }}</h3>
          <p class="mt-1 mb-0 truncate text-xs text-muted">{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
        </div>
        <Button
          :data-testid="mode === 'liked' ? 'cancel-like' : 'restore-dish'"
          class="min-h-11 shrink-0 rounded-lg! border-line! bg-paper-soft! px-2! text-xs! text-ink!"
          type="default"
          size="small"
          @click="emit('action', dish.id)"
        >
          {{ mode === 'liked' ? '取消喜欢' : '重新加入' }}
        </Button>
      </article>
    </Card>
  </div>

  <div v-else class="mt-4 rounded-2xl border border-dashed border-line bg-paper/70 px-5 py-8 text-center">
    <span class="text-2xl text-clay" aria-hidden="true">{{ mode === 'liked' ? '♡' : '✓' }}</span>
    <h3 class="mt-2 mb-0 font-display text-xl text-ink">{{ mode === 'liked' ? '还没有喜欢的菜' : '没有不喜欢的菜' }}</h3>
    <p v-if="mode === 'liked'" class="mb-0 text-sm leading-6 text-muted">回到今日菜单点“喜欢”，它下次出现的机会会翻倍。</p>
    <p v-else class="mb-0 text-sm leading-6 text-muted">遇到不合口味的菜直接标记，之后随机时会自动避开。</p>
  </div>
</template>
