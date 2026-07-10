<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Dish } from '../types/menu'

const props = defineProps<{
  open: boolean
  likedDishes: Dish[]
  dislikedDishes: Dish[]
}>()

const emit = defineEmits<{
  close: []
  'cancel-like': [dishId: string]
  restore: [dishId: string]
}>()

const activeTab = ref<'liked' | 'disliked'>('liked')
const visibleDishes = computed(() =>
  activeTab.value === 'liked' ? props.likedDishes : props.dislikedDishes,
)

const preferenceOwner = (dish: Dish) => {
  if (dish.role === 'baby') return '宝宝的口味'
  if (dish.role === 'spicy') return '妈妈的口味'
  return '全家的口味'
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="preference-drawer">
    <div v-if="open" class="preference-drawer__backdrop" @click.self="emit('close')">
      <aside
        class="preference-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preference-drawer-title"
      >
        <header class="preference-drawer__header">
          <div>
            <p>一家人的口味簿</p>
            <h2 id="preference-drawer-title">喜欢 / 不喜欢</h2>
          </div>
          <button
            data-testid="close-preferences"
            class="preference-drawer__close"
            type="button"
            aria-label="关闭口味偏好"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div class="preference-drawer__tabs" role="tablist" aria-label="口味偏好分类">
          <button
            class="preference-drawer__tab"
            :class="{ 'is-active': activeTab === 'liked' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'liked'"
            @click="activeTab = 'liked'"
          >
            喜欢的菜
            <span>{{ likedDishes.length }}</span>
          </button>
          <button
            data-testid="disliked-tab"
            class="preference-drawer__tab"
            :class="{ 'is-active': activeTab === 'disliked' }"
            type="button"
            role="tab"
            :aria-selected="activeTab === 'disliked'"
            @click="activeTab = 'disliked'"
          >
            不喜欢的菜
            <span>{{ dislikedDishes.length }}</span>
          </button>
        </div>

        <div class="preference-drawer__body">
          <div v-if="visibleDishes.length" class="preference-drawer__list">
            <article
              v-for="dish in visibleDishes"
              :key="dish.id"
              class="preference-drawer__item"
            >
              <div class="preference-drawer__dish-image">
                <img :src="dish.image" :alt="dish.name" />
              </div>
              <div class="preference-drawer__dish-copy">
                <span>{{ preferenceOwner(dish) }}</span>
                <h3>{{ dish.name }}</h3>
                <p>{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
              </div>
              <button
                v-if="activeTab === 'liked'"
                data-testid="cancel-like"
                class="preference-drawer__item-action"
                type="button"
                :aria-label="`取消喜欢${dish.name}`"
                @click="emit('cancel-like', dish.id)"
              >
                取消喜欢
              </button>
              <button
                v-else
                data-testid="restore-dish"
                class="preference-drawer__item-action preference-drawer__item-action--restore"
                type="button"
                :aria-label="`重新加入${dish.name}`"
                @click="emit('restore', dish.id)"
              >
                重新加入
              </button>
            </article>
          </div>

          <div v-else class="preference-drawer__empty">
            <span aria-hidden="true">{{ activeTab === 'liked' ? '♡' : '✓' }}</span>
            <h3>
              {{ activeTab === 'liked' ? '还没有喜欢的菜' : '没有不喜欢的菜' }}
            </h3>
            <p v-if="activeTab === 'liked'">在今日菜单里点“喜欢”，它下次出现的机会会翻倍。</p>
            <p v-else>遇到不合口味的菜可以直接标记，之后随机时会自动避开。</p>
          </div>
        </div>

        <footer class="preference-drawer__footer">
          <span>喜欢 ×2 概率</span>
          <span>不喜欢 自动避开</span>
        </footer>
      </aside>
    </div>
  </Transition>
</template>
