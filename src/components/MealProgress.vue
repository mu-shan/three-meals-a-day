<script setup lang="ts">
import { computed } from 'vue'
import { getMealProgressState } from '../domain/mealTimeline'
import type { MealType } from '../types/menu'

const props = defineProps<{ now: Date }>()

const steps: Array<{ key: MealType; label: string; time: string }> = [
  { key: 'breakfast', label: '早餐', time: '07:30' },
  { key: 'lunch', label: '午餐', time: '12:00' },
  { key: 'dinner', label: '晚餐', time: '18:30' },
]

const state = computed(() => getMealProgressState(props.now))
const activeStep = computed(() => steps.find((step) => step.key === state.value.active))
</script>

<template>
  <section class="mt-5 rounded-2xl border border-line/70 bg-paper/85 p-4 shadow-paper" aria-label="今日用餐时间进度">
    <div class="flex items-center justify-between gap-3 text-xs font-bold tracking-wide text-muted">
      <span>今日用餐进度</span>
      <span class="text-forest-dark">{{ activeStep ? `下一餐 · ${activeStep.label}` : '今日三餐已到点' }}</span>
    </div>
    <ol class="mt-4 grid grid-cols-3 gap-1">
      <li
        v-for="step in steps"
        :key="step.key"
        data-meal-step
        :class="[
          'relative flex flex-col items-center gap-1 text-center text-xs font-semibold text-muted before:absolute before:top-2 before:left-1/2 before:-z-10 before:h-0.5 before:w-full before:bg-line last:before:hidden',
          { 'is-completed text-forest': state.completed.includes(step.key), 'is-active text-forest-dark': state.active === step.key },
        ]"
        :aria-current="state.active === step.key ? 'step' : undefined"
      >
        <i
          aria-hidden="true"
          :class="[
            'h-4 w-4 rounded-full border-2 border-paper bg-paper shadow-sm',
            { 'bg-forest': state.completed.includes(step.key), 'bg-clay ring-4 ring-clay/15': state.active === step.key },
          ]"
        />
        <span>{{ step.label }}</span>
        <small class="text-[10px] font-normal text-muted">{{ step.time }}</small>
      </li>
    </ol>
  </section>
</template>
