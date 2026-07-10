<script setup lang="ts">
import { ref, watch } from 'vue'
import placeholder from '../assets/dish-placeholder.svg'
import type { Dish } from '../types/menu'

const props = withDefaults(
  defineProps<{ dish: Dish; liked?: boolean; disabled?: boolean }>(),
  { liked: false, disabled: false },
)
const emit = defineEmits<{
  replace: [dishId: string]
  like: [dishId: string]
  dislike: [dishId: string]
}>()

const imageSrc = ref(props.dish.image)

watch(
  () => props.dish.image,
  (image) => {
    imageSrc.value = image
  },
)

const roleLabel = {
  staple: '今日主食',
  baby: '宝宝友好',
  spicy: '妈妈辣菜',
  shared: '全家共享',
  drink: '蛋奶能量',
  fruit: '新鲜水果',
} as const

const onImageError = () => {
  imageSrc.value = placeholder
}
</script>

<template>
  <article class="dish-card" :class="`dish-card--${dish.role}`">
    <div class="dish-card__image-wrap">
      <img class="dish-card__image" :src="imageSrc" :alt="dish.name" @error="onImageError" />
      <span class="dish-card__role">{{ roleLabel[dish.role] }}</span>
    </div>
    <div class="dish-card__content">
      <div>
        <h3>{{ dish.name }}</h3>
        <p>{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
      </div>
      <div class="dish-card__actions">
        <button
          data-testid="replace-dish"
          class="dish-card__swap"
          type="button"
          :disabled="disabled"
          :aria-label="`换掉${dish.name}`"
          @click="emit('replace', dish.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 7h-9a5 5 0 0 0-5 5v1M4 17h9a5 5 0 0 0 5-5v-1M17 4l3 3-3 3M7 20l-3-3 3-3" />
          </svg>
          <span>换一道</span>
        </button>
        <button
          data-testid="like-dish"
          class="dish-card__preference dish-card__preference--like"
          :class="{ 'is-active': liked }"
          type="button"
          :disabled="disabled"
          :aria-label="liked ? `取消喜欢${dish.name}` : `喜欢${dish.name}`"
          :aria-pressed="liked"
          @click="emit('like', dish.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
          </svg>
          <span>喜欢</span>
        </button>
        <button
          data-testid="dislike-dish"
          class="dish-card__preference dish-card__preference--dislike"
          type="button"
          :disabled="disabled"
          :aria-label="`不喜欢${dish.name}`"
          @click="emit('dislike', dish.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 13-1 7 5-5h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H9L4 12v1h4Z" />
          </svg>
          <span>不喜欢</span>
        </button>
      </div>
    </div>
  </article>
</template>
