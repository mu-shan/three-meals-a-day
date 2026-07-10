<script setup lang="ts">
import { Button } from 'animal-island-vue'

withDefaults(
  defineProps<{
    date: Date
    loading: boolean
    preferenceCount?: number
  }>(),
  { preferenceCount: 0 },
)

const emit = defineEmits<{ generate: []; 'open-preferences': [] }>()

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
</script>

<template>
  <header class="family-hero">
    <div class="family-hero__copy">
      <p class="family-hero__eyebrow">
        <span class="family-hero__dot" />
        {{ formatDate(date) }} · 全家今日菜单
      </p>
      <h1>今天<span>吃点啥？</span></h1>
      <p class="family-hero__lead">不用再发愁，让小餐桌帮一家三口安排得明明白白。</p>
      <div class="family-hero__actions">
        <Button
          data-testid="generate-menu"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="loading"
          @click="emit('generate')"
        >
          <span class="family-hero__button-label">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 3v8M5 3v5c0 2 1.3 3 3 3s3-1 3-3V3M8 11v10M16 3v18M16 3c3 2 4 5 4 8h-4" />
            </svg>
            一键开饭
          </span>
        </Button>
        <button
          data-testid="open-preferences"
          class="family-hero__preference-button"
          type="button"
          @click="emit('open-preferences')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
          </svg>
          <span>口味偏好</span>
          <b v-if="preferenceCount">{{ preferenceCount }}</b>
        </button>
      </div>
      <p class="family-hero__hint">每一餐都能单独换，直到全家都点头</p>
    </div>

    <div class="family-hero__art" aria-hidden="true">
      <span class="family-hero__sun" />
      <img
        src="https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f46a.svg"
        alt=""
      />
      <div class="family-hero__table">
        <span class="family-hero__plate" />
        <span class="family-hero__bowl" />
        <span class="family-hero__cup" />
      </div>
      <span class="family-hero__leaf family-hero__leaf--one" />
      <span class="family-hero__leaf family-hero__leaf--two" />
    </div>
  </header>
</template>
