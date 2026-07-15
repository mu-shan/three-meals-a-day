<script setup lang="ts">
defineProps<{ variant: 'meal' | 'shopping' }>()
</script>

<template>
  <div
    :data-testid="`card-corner-decoration-${variant}`"
    :class="[
      'pointer-events-none absolute top-3 right-3 select-none sm:top-4 sm:right-4',
      variant === 'meal' ? 'text-forest/15' : 'text-sand/30',
    ]"
    aria-hidden="true"
  >
    <svg
      v-if="variant === 'meal'"
      class="h-14 w-20 sm:h-16 sm:w-24"
      viewBox="0 0 96 64"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 10v15a7 7 0 0 0 14 0V10M27 10v44" />
      <ellipse cx="61" cy="20" rx="9" ry="12" />
      <path d="M61 32v22M78 10v8M74 14h8" />
      <circle cx="83" cy="29" r="2" fill="currentColor" stroke="none" />
      <circle cx="78" cy="39" r="1.5" fill="currentColor" stroke="none" />
    </svg>

    <svg
      v-else
      class="h-16 w-20 sm:h-20 sm:w-24"
      viewBox="0 0 96 80"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 34h56l-6 30H26l-6-30ZM34 34c1-13 8-20 14-20s13 7 14 20" />
      <path d="M34 43v12M48 43v12M62 43v12M69 17c8-1 13-6 14-12-8 0-13 4-14 12ZM69 17c-4-5-9-7-14-6 2 6 7 9 14 6Z" />
      <circle cx="17" cy="15" r="2" fill="currentColor" stroke="none" />
      <circle cx="25" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  </div>
</template>
