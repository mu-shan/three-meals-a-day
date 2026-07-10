// @vitest-environment jsdom

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePreferencesStore } from './preferences'

describe('口味偏好 store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
  })

  it('初始化时恢复并清洗本地偏好', () => {
    window.localStorage.setItem(
      'family-meal-picker:preferences',
      JSON.stringify({
        likedIds: ['tomato-eggs', 'missing-dish', 'pepper-pork'],
        dislikedIds: ['pepper-pork'],
      }),
    )
    const store = usePreferencesStore()

    store.initialize()

    expect(store.likedIds).toEqual(['tomato-eggs'])
    expect(store.dislikedIds).toEqual(['pepper-pork'])
    expect(store.rules.likedIds.has('tomato-eggs')).toBe(true)
    expect(store.preferenceCount).toBe(2)
  })

  it('喜欢、不喜欢和恢复状态保持互斥并持久化', () => {
    const store = usePreferencesStore()
    store.initialize()

    store.toggleLike('tomato-eggs')
    expect(store.isLiked('tomato-eggs')).toBe(true)

    store.dislike('tomato-eggs')
    expect(store.isLiked('tomato-eggs')).toBe(false)
    expect(store.isDisliked('tomato-eggs')).toBe(true)

    store.restore('tomato-eggs')
    expect(store.isDisliked('tomato-eggs')).toBe(false)
    expect(JSON.parse(window.localStorage.getItem('family-meal-picker:preferences') ?? '{}'))
      .toEqual({ likedIds: [], dislikedIds: [] })
  })

  it('导入替换时过滤无效与冲突偏好', () => {
    const store = usePreferencesStore()
    store.initialize()

    store.replacePreferences({
      likedIds: ['pepper-pork', 'missing-dish', 'tomato-eggs'],
      dislikedIds: ['tomato-eggs'],
    })

    expect(store.likedIds).toEqual(['pepper-pork'])
    expect(store.dislikedIds).toEqual(['tomato-eggs'])
    expect(store.likedDishes.map((dish) => dish.id)).toEqual(['pepper-pork'])
    expect(store.dislikedDishes.map((dish) => dish.id)).toEqual(['tomato-eggs'])
  })
})
