import { computed, ref } from 'vue'
import {
  loadDishPreferences,
  saveDishPreferences,
} from '../services/dishPreferenceStorage'
import type { DishPreferences } from '../types/menu'

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

export function useDishPreferences(
  storage: PreferenceStorage,
  validIds: ReadonlySet<string>,
) {
  const preferences = ref<DishPreferences>(loadDishPreferences(storage, validIds))
  saveDishPreferences(storage, preferences.value)

  const persist = (next: DishPreferences) => {
    preferences.value = next
    saveDishPreferences(storage, next)
  }

  const isLiked = (dishId: string) => preferences.value.likedIds.includes(dishId)
  const isDisliked = (dishId: string) => preferences.value.dislikedIds.includes(dishId)

  const toggleLike = (dishId: string) => {
    if (!validIds.has(dishId)) return

    const likedIds = isLiked(dishId)
      ? preferences.value.likedIds.filter((id) => id !== dishId)
      : [...preferences.value.likedIds, dishId]

    persist({
      likedIds,
      dislikedIds: preferences.value.dislikedIds.filter((id) => id !== dishId),
    })
  }

  const dislike = (dishId: string) => {
    if (!validIds.has(dishId) || isDisliked(dishId)) return

    persist({
      likedIds: preferences.value.likedIds.filter((id) => id !== dishId),
      dislikedIds: [...preferences.value.dislikedIds, dishId],
    })
  }

  const restore = (dishId: string) => {
    persist({
      likedIds: preferences.value.likedIds,
      dislikedIds: preferences.value.dislikedIds.filter((id) => id !== dishId),
    })
  }

  const likedIds = computed(() => preferences.value.likedIds)
  const dislikedIds = computed(() => preferences.value.dislikedIds)
  const rules = computed(() => ({
    likedIds: new Set(preferences.value.likedIds),
    dislikedIds: new Set(preferences.value.dislikedIds),
  }))

  return {
    likedIds,
    dislikedIds,
    rules,
    isLiked,
    isDisliked,
    toggleLike,
    dislike,
    restore,
  }
}
