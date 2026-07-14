<script setup lang="ts">
import { Button, Time, Title, Typewriter } from 'animal-island-vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MealProgress from './MealProgress.vue'

const props = defineProps<{ loading: boolean; now?: Date }>()
const emit = defineEmits<{ generate: [] }>()

const currentNow = ref(props.now ?? new Date())
let timer: number | undefined

watch(
  () => props.now,
  (now) => {
    if (now) currentNow.value = now
  },
)

onMounted(() => {
  if (props.now) return

  // 页面常驻时每分钟刷新，避免日期、问候和餐次阶段与本地时间脱节。
  timer = window.setInterval(() => {
    currentNow.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer)
})

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)

const greeting = computed(() => {
  const hour = currentNow.value.getHours()

  if (hour < 11) return '早上好，今天也元气开饭'
  if (hour < 14) return '中午好，慢慢吃顿好饭'
  if (hour < 18) return '下午好，晚餐也安排好啦'
  return '傍晚好，今天也轻松吃饭'
})

const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
</script>

<template>
  <header class="px-4 pt-7 pb-6 sm:px-5">
    <div class="flex items-center justify-between gap-3">
      <p class="m-0 font-display text-base font-bold tracking-wide text-ink">{{ formatDate(currentNow) }}</p>
      <Time class="shrink-0" />
    </div>
    <div class="mt-6 text-sm font-semibold tracking-wide text-forest-dark">
      <Typewriter v-if="!reduceMotion" :text="greeting" :speed="45" />
      <span v-else>{{ greeting }}</span>
    </div>
    <Title class="mt-2 block font-display text-[2.6rem] leading-[.94] text-ink" size="large" color="brown">
      一家人的<br /><em>三顿饭</em>
    </Title>
    <MealProgress :now="currentNow" />
    <Button
      data-testid="generate-menu"
      class="mt-5 min-h-14 w-full rounded-2xl! bg-forest! text-base! font-bold! shadow-paper transition-colors hover:bg-forest-dark!"
      type="primary"
      size="large"
      block
      :loading="loading"
      :disabled="loading"
      @click="emit('generate')"
    >
      重新安排今日菜单
    </Button>
  </header>
</template>
