<script setup lang="ts">
import { Button, Typewriter } from 'animal-island-vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ disabled: boolean; now?: Date }>()
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
  <header class="px-4 pt-7 pb-5 sm:px-5">
    <div class="flex items-center gap-2">
      <span class="size-2 rounded-full bg-clay" aria-hidden="true"></span>
      <p class="m-0 text-xs font-bold tracking-[.12em] text-forest-dark">{{ formatDate(currentNow) }} · 全家今日菜单</p>
    </div>

    <div class="mt-4 text-sm font-semibold tracking-wide text-forest-dark">
      <Typewriter v-if="!reduceMotion" :text="greeting" :speed="45" />
      <span v-else>{{ greeting }}</span>
    </div>

    <h1 class="mt-2 mb-0 font-display text-[2.6rem] leading-none text-ink">今天<span class="text-clay">吃点啥？</span></h1>
    <p class="mt-3 mb-0 text-sm leading-6 text-muted">不用再发愁，让小餐桌帮一家三口安排得明明白白。</p>

    <Button
      data-testid="generate-menu"
      class="mt-5 min-h-14 w-full rounded-2xl! bg-forest! text-base! font-bold! shadow-paper transition-colors hover:bg-forest-dark!"
      type="primary"
      size="large"
      block
      :disabled="disabled"
      @click="emit('generate')"
    >
      <span class="inline-flex items-center justify-center gap-2">
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18M16 3v18M16 3c2.2 0 3 2 3 4s-.8 4-3 4" />
        </svg>
        一键开饭
      </span>
    </Button>

    <p class="mt-3 mb-0 text-center text-xs leading-5 text-muted">每一餐都能单独换，直到全家都点头</p>
  </header>
</template>
