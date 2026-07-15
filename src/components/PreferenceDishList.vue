<script setup lang="ts">
import { Button } from 'animal-island-vue'
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
  <div v-if="dishes.length" class="grid gap-2.5">
    <article
      v-for="dish in dishes"
      :key="dish.id"
      class="flex min-w-0 items-center gap-2 rounded-2xl border-2 border-line/60 bg-white/75 p-2 sm:gap-3 sm:p-2.5"
    >
      <div class="size-14 shrink-0 overflow-hidden rounded-xl bg-sand/45">
        <img class="size-14 object-cover" :src="dish.image" :alt="dish.name" />
      </div>
      <div class="min-w-0 flex-1">
        <span class="block truncate text-[10px] font-bold tracking-wide text-forest-dark">{{ preferenceOwner(dish) }}</span>
        <h3 class="mt-0.5 mb-0 truncate font-display text-base text-ink">{{ dish.name }}</h3>
        <p class="mt-1 mb-0 truncate text-[10px] text-muted">{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
      </div>
      <Button
        :data-testid="mode === 'liked' ? 'cancel-like' : 'restore-dish'"
        class="min-h-11 shrink-0 rounded-full! border-line! bg-paper-soft! px-2! text-[10px]! text-ink! sm:px-3!"
        type="default"
        size="small"
        @click="emit('action', dish.id)"
      >
        {{ mode === 'liked' ? '取消喜欢' : '重新加入' }}
      </Button>
    </article>
  </div>

  <div v-else class="grid min-h-60 place-content-center place-items-center rounded-3xl border-2 border-dashed border-line px-5 py-8 text-center">
    <span class="mb-3 grid size-16 place-items-center rounded-full bg-sand/45 font-display text-4xl text-clay" aria-hidden="true">
      {{ mode === 'liked' ? '♡' : '✓' }}
    </span>
    <h3 class="m-0 font-display text-xl text-ink">{{ mode === 'liked' ? '还没有喜欢的菜' : '没有不喜欢的菜' }}</h3>
    <p v-if="mode === 'liked'" class="mt-2 mb-0 text-xs leading-5 text-muted">回到今日菜单点“喜欢”，它下次出现的机会会翻倍。</p>
    <p v-else class="mt-2 mb-0 text-xs leading-5 text-muted">遇到不合口味的菜直接标记，之后随机时会自动避开。</p>
  </div>
</template>
