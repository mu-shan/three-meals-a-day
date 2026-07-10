// @vitest-environment jsdom

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateDailyMenu } from '../domain/menuGenerator'
import { saveTodayMenu } from '../services/todayMenuStorage'
import { useMenuStore } from './menu'
import { usePreferencesStore } from './preferences'

const testDate = new Date(2026, 6, 10, 8, 30)

describe('当天菜单 store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  it('初始化时恢复当天菜单并生成采购清单', () => {
    const savedMenu = generateDailyMenu('2026-07-10')
    saveTodayMenu(window.localStorage, savedMenu)
    const store = useMenuStore()

    store.initialize(testDate)

    expect(store.menu).toEqual(savedMenu)
    expect(Object.values(store.shoppingList).flat().length).toBeGreaterThan(0)
    expect(store.today).toBe('2026-07-10')
  })

  it('不喜欢当前菜品后保存偏好并在动画后即时替换', async () => {
    const store = useMenuStore()
    store.initialize(testDate)
    const preferences = usePreferencesStore()
    const target = store.menu!.breakfast.dishes[0]

    expect(store.dislikeDish('breakfast', target.id)).toBe(true)
    expect(preferences.isDisliked(target.id)).toBe(true)
    expect(store.isShuffling).toBe(true)

    await vi.advanceTimersByTimeAsync(420)

    expect(store.menu!.breakfast.dishes.some((dish) => dish.id === target.id)).toBe(false)
    expect(store.isShuffling).toBe(false)
  })

  it('换菜期间拒绝重复操作并在完成后恢复', async () => {
    const store = useMenuStore()
    store.initialize(testDate)
    const target = store.menu!.lunch.dishes[0]

    expect(store.rerollDish('lunch', target.id)).toBe(true)
    expect(store.generateAll()).toBe(false)

    await vi.advanceTimersByTimeAsync(420)

    expect(store.isShuffling).toBe(false)
    expect(store.generateAll()).toBe(true)
  })

  it('偏好导致菜单无解时恢复候选并保持应用可用', () => {
    window.localStorage.setItem(
      'family-meal-picker:preferences',
      JSON.stringify({
        likedIds: [],
        dislikedIds: [
          'millet-porridge',
          'pumpkin-porridge',
          'oatmeal',
          'steamed-bun',
          'boiled-corn',
          'steamed-sweet-potato',
          'egg-pancake',
          'toast',
        ],
      }),
    )
    const store = useMenuStore()

    expect(() => store.initialize(testDate)).not.toThrow()
    expect(store.menu).not.toBeNull()
    expect(usePreferencesStore().dislikedIds).toEqual([])
    expect(store.feedback).toContain('恢复')
  })
})
