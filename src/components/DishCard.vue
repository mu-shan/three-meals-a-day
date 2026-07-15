<script setup lang="ts">
import { Button } from 'animal-island-vue'
import { computed, ref, watch } from 'vue'
import placeholder from '../assets/dish-placeholder.svg'
import type { Dish } from '../types/menu'
import { dishRoleMeta } from '../ui/dishRoleMeta'

const props = withDefaults(
  defineProps<{
    dish: Dish
    liked?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  { liked: false, disabled: false, loading: false },
)
const emit = defineEmits<{
  replace: [dishId: string]
  like: [dishId: string]
  dislike: [dishId: string]
}>()

const imageSrc = ref(props.dish.image)
const roleMeta = computed(() => dishRoleMeta[props.dish.role])

watch(
  () => props.dish.image,
  (image) => {
    imageSrc.value = image
  },
)

const onImageError = () => {
  imageSrc.value = placeholder
}
</script>

<template>
  <article
    :class="[
      'relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border-2 p-2.5 shadow-sm',
      roleMeta.cardClass,
    ]"
    :data-role="dish.role"
  >
    <div
      data-testid="dish-image-wrap"
      :class="[
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl max-[380px]:h-20 max-[380px]:w-20',
        roleMeta.imageClass,
      ]"
    >
      <img
        class="h-full w-full object-cover"
        :src="imageSrc"
        :alt="dish.name"
        @error="onImageError"
      />
      <span
        data-testid="role-label"
        :class="[
          'absolute right-1.5 bottom-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm',
          roleMeta.badgeClass,
        ]"
      >
        {{ roleMeta.label }}
      </span>
    </div>

    <div class="min-w-0 flex-1 pb-11">
      <h3 class="m-0 truncate pr-24 font-display text-lg leading-6 text-ink">
        {{ dish.name }}
      </h3>
      <p class="mt-1 mb-0 line-clamp-2 text-xs leading-5 text-muted">
        {{ dish.ingredients.map((item) => item.name).join(' · ') }}
      </p>
    </div>

    <div class="absolute top-2.5 right-2.5 flex gap-1.5">
      <button
        data-testid="like-dish"
        type="button"
        :class="[
          'grid h-11 w-11 place-items-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-45',
          liked
            ? 'border-[#c96262] bg-[#f8caca] text-[#a83f3f]'
            : 'border-[#e6a8a5] bg-[#fff0ef] text-[#b74e4e]',
        ]"
        :disabled="disabled"
        :aria-label="liked ? `取消喜欢${dish.name}` : `喜欢${dish.name}`"
        :aria-pressed="liked"
        @click="emit('like', dish.id)"
      >
        <svg
          data-icon="heart"
          :class="['size-5', { 'fill-current': liked }]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
        </svg>
      </button>

      <button
        data-testid="dislike-dish"
        type="button"
        class="grid h-11 w-11 place-items-center rounded-xl border border-line bg-paper text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-45"
        :disabled="disabled"
        :aria-label="`不喜欢${dish.name}`"
        @click="emit('dislike', dish.id)"
      >
        <svg
          data-icon="heart-off"
          class="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
          <path d="m4 4 16 16" />
        </svg>
      </button>
    </div>

    <Button
      data-testid="replace-dish"
      class="absolute right-2.5 bottom-2.5 min-h-11 rounded-xl! border-line! bg-paper! px-3! text-xs! text-ink!"
      type="default"
      size="small"
      :loading="loading"
      :disabled="disabled"
      :aria-busy="loading"
      :aria-label="`换掉${dish.name}`"
      @click="emit('replace', dish.id)"
    >
      <span class="inline-flex items-center gap-1.5">
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 7h-9a5 5 0 0 0-5 5v1M4 17h9a5 5 0 0 0 5-5v-1M17 4l3 3-3 3M7 20l-3-3 3-3" />
        </svg>
        换一道
      </span>
    </Button>
  </article>
</template>
