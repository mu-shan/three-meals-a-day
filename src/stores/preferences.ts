import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { dishes } from '../data/dishes'
import {
  loadDishPreferences,
  normalizeDishPreferences,
  saveDishPreferences,
} from '../services/dishPreferenceStorage'
import type { DishPreferences } from '../types/menu'

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>

const validDishIds = new Set(dishes.map((dish) => dish.id))

export const usePreferencesStore = defineStore('preferences', () => {
  const likedIds = ref<string[]>([])
  const dislikedIds = ref<string[]>([])
  const initialized = ref(false)
  let storage: PreferenceStorage | null = null

  const rules = computed(() => ({
    likedIds: new Set(likedIds.value),
    dislikedIds: new Set(dislikedIds.value),
  }))
  const likedDishes = computed(() =>
    likedIds.value.flatMap((id) => {
      const dish = dishes.find((item) => item.id === id)
      return dish ? [dish] : []
    }),
  )
  const dislikedDishes = computed(() =>
    dislikedIds.value.flatMap((id) => {
      const dish = dishes.find((item) => item.id === id)
      return dish ? [dish] : []
    }),
  )
  const preferenceCount = computed(
    () => likedIds.value.length + dislikedIds.value.length,
  )

  const persist = () => {
    if (!storage) return
    saveDishPreferences(storage, {
      likedIds: likedIds.value,
      dislikedIds: dislikedIds.value,
    })
  }

  const applyPreferences = (preferences: DishPreferences) => {
    likedIds.value = [...preferences.likedIds]
    dislikedIds.value = [...preferences.dislikedIds]
    persist()
  }

  const initialize = (
    nextStorage: PreferenceStorage = window.localStorage,
  ) => {
    if (initialized.value) return

    storage = nextStorage
    const preferences = loadDishPreferences(nextStorage, validDishIds)
    likedIds.value = preferences.likedIds
    dislikedIds.value = preferences.dislikedIds
    initialized.value = true
    persist()
  }

  const ensureInitialized = () => {
    if (!initialized.value) initialize()
  }

  const isLiked = (dishId: string) => likedIds.value.includes(dishId)
  const isDisliked = (dishId: string) => dislikedIds.value.includes(dishId)

  const toggleLike = (dishId: string) => {
    ensureInitialized()
    if (!validDishIds.has(dishId)) return

    applyPreferences({
      likedIds: isLiked(dishId)
        ? likedIds.value.filter((id) => id !== dishId)
        : [...likedIds.value, dishId],
      dislikedIds: dislikedIds.value.filter((id) => id !== dishId),
    })
  }

  const dislike = (dishId: string) => {
    ensureInitialized()
    if (!validDishIds.has(dishId) || isDisliked(dishId)) return

    applyPreferences({
      likedIds: likedIds.value.filter((id) => id !== dishId),
      dislikedIds: [...dislikedIds.value, dishId],
    })
  }

  const restore = (dishId: string) => {
    ensureInitialized()
    applyPreferences({
      likedIds: likedIds.value,
      dislikedIds: dislikedIds.value.filter((id) => id !== dishId),
    })
  }

  const replacePreferences = (preferences: DishPreferences) => {
    ensureInitialized()
    applyPreferences(normalizeDishPreferences(preferences, validDishIds))
  }

  return {
    likedIds,
    dislikedIds,
    initialized,
    rules,
    likedDishes,
    dislikedDishes,
    preferenceCount,
    initialize,
    isLiked,
    isDisliked,
    toggleLike,
    dislike,
    restore,
    replacePreferences,
  }
})
