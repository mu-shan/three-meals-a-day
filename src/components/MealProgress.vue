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
  <section class="meal-progress" aria-label="今日用餐时间进度">
    <div class="meal-progress__heading">
      <span>今日用餐进度</span>
      <span>{{ activeStep ? `下一餐 · ${activeStep.label}` : '今日三餐已到点' }}</span>
    </div>
    <ol>
      <li
        v-for="step in steps"
        :key="step.key"
        data-meal-step
        :class="{
          'is-completed': state.completed.includes(step.key),
          'is-active': state.active === step.key,
        }"
        :aria-current="state.active === step.key ? 'step' : undefined"
      >
        <i aria-hidden="true" />
        <span>{{ step.label }}</span>
        <small>{{ step.time }}</small>
      </li>
    </ol>
  </section>
</template>
