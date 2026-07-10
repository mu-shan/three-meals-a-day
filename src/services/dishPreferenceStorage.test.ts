import { describe, expect, it } from 'vitest'
import {
  loadDishPreferences,
  saveDishPreferences,
} from './dishPreferenceStorage'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  value: string | null = null

  getItem() {
    return this.value
  }

  setItem(_key: string, value: string) {
    this.value = value
  }
}

const validIds = new Set(['tomato-eggs', 'pepper-pork', 'steamed-rice'])

describe('菜品偏好存储', () => {
  it('空存储返回空偏好', () => {
    expect(loadDishPreferences(new MemoryStorage(), validIds)).toEqual({
      likedIds: [],
      dislikedIds: [],
    })
  })

  it('保存后可恢复菜品偏好', () => {
    const storage = new MemoryStorage()
    const preferences = {
      likedIds: ['tomato-eggs'],
      dislikedIds: ['pepper-pork'],
    }

    expect(saveDishPreferences(storage, preferences)).toBe(true)
    expect(loadDishPreferences(storage, validIds)).toEqual(preferences)
  })

  it('读取时忽略无效菜品并让不喜欢状态优先', () => {
    const storage = new MemoryStorage()
    storage.value = JSON.stringify({
      likedIds: ['tomato-eggs', 'missing-dish', 'pepper-pork'],
      dislikedIds: ['pepper-pork', 123, 'removed-dish'],
    })

    expect(loadDishPreferences(storage, validIds)).toEqual({
      likedIds: ['tomato-eggs'],
      dislikedIds: ['pepper-pork'],
    })
  })

  it('损坏数据或存储异常时静默降级', () => {
    const damagedStorage = new MemoryStorage()
    damagedStorage.value = '{bad json'
    const brokenStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }

    expect(loadDishPreferences(damagedStorage, validIds)).toEqual({
      likedIds: [],
      dislikedIds: [],
    })
    expect(loadDishPreferences(brokenStorage, validIds)).toEqual({
      likedIds: [],
      dislikedIds: [],
    })
    expect(
      saveDishPreferences(brokenStorage, { likedIds: [], dislikedIds: [] }),
    ).toBe(false)
  })
})
