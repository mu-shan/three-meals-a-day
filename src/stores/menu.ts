import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  generateBreakfast,
  generateDailyMenu,
  generateDinner,
  generateLunch,
  reconcileDailyMenu,
  replaceDish,
} from '../domain/menuGenerator'
import { buildShoppingList } from '../domain/shoppingList'
import {
  formatLocalDate,
  loadTodayMenu,
  saveTodayMenu,
} from '../services/todayMenuStorage'
import type { AppBackupV1, DailyMenu, MealType, ShoppingListData } from '../types/menu'
import { usePreferencesStore } from './preferences'

type MenuStorage = Pick<Storage, 'getItem' | 'setItem'>

const emptyShoppingList = (): ShoppingListData => ({
  vegetables: [],
  protein: [],
  staples: [],
  fruit: [],
})

export const useMenuStore = defineStore('menu', () => {
  const menu = ref<DailyMenu | null>(null)
  const today = ref('')
  const isShuffling = ref(false)
  const feedback = ref('')
  const initialized = ref(false)
  let storage: MenuStorage | null = null
  let feedbackTimer: number | undefined

  const preferences = usePreferencesStore()
  const shoppingList = computed(() =>
    menu.value ? buildShoppingList(menu.value) : emptyShoppingList(),
  )

  const notify = (message: string) => {
    feedback.value = message
    window.clearTimeout(feedbackTimer)
    feedbackTimer = window.setTimeout(() => {
      feedback.value = ''
    }, 2200)
  }

  const clearFeedback = () => {
    window.clearTimeout(feedbackTimer)
    feedback.value = ''
  }

  const persist = (nextMenu: DailyMenu) => {
    menu.value = nextMenu
    if (storage) saveTodayMenu(storage, nextMenu)
  }

  const restoreCandidatePreferences = () => {
    for (const dishId of [...preferences.dislikedIds]) {
      preferences.restore(dishId)
    }
  }

  const initialize = (
    date: Date = new Date(),
    nextStorage: MenuStorage = window.localStorage,
  ) => {
    const formattedDate = formatLocalDate(date)
    if (initialized.value && today.value === formattedDate) return

    storage = nextStorage
    today.value = formattedDate
    preferences.initialize(nextStorage)
    const storedMenu = loadTodayMenu(nextStorage, formattedDate)

    try {
      persist(
        storedMenu
          ? reconcileDailyMenu(storedMenu, preferences.rules)
          : generateDailyMenu(formattedDate, preferences.rules),
      )
    } catch {
      restoreCandidatePreferences()
      persist(generateDailyMenu(formattedDate, preferences.rules))
      notify('不喜欢的菜太多，已恢复候选以保证菜单可用')
    }

    initialized.value = true
  }

  const ensureInitialized = () => {
    if (!initialized.value) initialize()
  }

  const refreshDate = (date: Date = new Date()) => {
    const nextDate = formatLocalDate(date)
    if (!initialized.value || nextDate !== today.value) initialize(date, storage ?? window.localStorage)
  }

  const shuffle = (createMenu: () => DailyMenu) => {
    refreshDate()
    if (isShuffling.value) return false

    isShuffling.value = true
    window.setTimeout(() => {
      try {
        persist(createMenu())
      } catch {
        notify('当前偏好下没有足够候选，请恢复一些不喜欢的菜')
      } finally {
        isShuffling.value = false
      }
    }, 420)
    return true
  }

  const generateAll = () =>
    shuffle(() => generateDailyMenu(today.value, preferences.rules))

  const rerollMeal = (type: MealType) =>
    shuffle(() => {
      const currentMenu = menu.value!
      const otherIds = new Set(
        (['breakfast', 'lunch', 'dinner'] as MealType[])
          .filter((mealType) => mealType !== type)
          .flatMap((mealType) => currentMenu[mealType].dishes.map((dish) => dish.id)),
      )
      const nextMeal =
        type === 'breakfast'
          ? generateBreakfast(otherIds, preferences.rules)
          : type === 'lunch'
            ? generateLunch({ excludedIds: otherIds, preferences: preferences.rules })
            : generateDinner(otherIds, preferences.rules)

      return { ...currentMenu, [type]: nextMeal }
    })

  const rerollDish = (type: MealType, dishId: string) =>
    shuffle(() => ({
      ...menu.value!,
      [type]: replaceDish(menu.value![type], dishId, preferences.rules),
    }))

  const toggleLike = (dishId: string) => {
    const wasLiked = preferences.isLiked(dishId)
    preferences.toggleLike(dishId)
    notify(wasLiked ? '已取消喜欢' : '已加入喜欢，下次出现概率翻倍')
  }

  const dislikeDish = (type: MealType, dishId: string) => {
    refreshDate()
    if (isShuffling.value) return false

    const nextRules = {
      likedIds: new Set([...preferences.rules.likedIds].filter((id) => id !== dishId)),
      dislikedIds: new Set([...preferences.rules.dislikedIds, dishId]),
    }
    const nextMeal = replaceDish(menu.value![type], dishId, nextRules)

    if (nextMeal === menu.value![type]) {
      notify('这类菜至少要保留一道，暂时不能移除')
      return false
    }

    preferences.dislike(dishId)
    notify('已记入不喜欢，并为你换了一道')
    return shuffle(() => ({ ...menu.value!, [type]: nextMeal }))
  }

  const replaceImportedMenu = (nextMenu: DailyMenu) => {
    ensureInitialized()
    persist(nextMenu)
  }

  const regenerateToday = () => {
    ensureInitialized()
    persist(generateDailyMenu(today.value, preferences.rules))
  }

  const restoreBackup = (backup: AppBackupV1) => {
    ensureInitialized()
    const nextRules = {
      likedIds: new Set(backup.preferences.likedIds),
      dislikedIds: new Set(backup.preferences.dislikedIds),
    }
    try {
      const nextMenu = backup.menu.date === today.value
        ? reconcileDailyMenu(backup.menu, nextRules)
        : generateDailyMenu(today.value, nextRules)
      preferences.replacePreferences(backup.preferences)
      persist(nextMenu)
      notify('备份已恢复')
      return true
    } catch {
      notify('备份中的偏好无法生成完整菜单，未覆盖当前数据')
      return false
    }
  }

  return {
    menu,
    today,
    isShuffling,
    feedback,
    initialized,
    shoppingList,
    initialize,
    refreshDate,
    notify,
    clearFeedback,
    generateAll,
    rerollMeal,
    rerollDish,
    toggleLike,
    dislikeDish,
    replaceImportedMenu,
    regenerateToday,
    restoreBackup,
  }
})
