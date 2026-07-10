import { describe, expect, it } from 'vitest'
import { useDishPreferences } from './useDishPreferences'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  value: string | null = null

  getItem() {
    return this.value
  }

  setItem(_key: string, value: string) {
    this.value = value
  }
}

const validIds = new Set(['tomato-eggs', 'pepper-pork'])

describe('菜品偏好状态', () => {
  it('可切换喜欢状态并同步规则集合', () => {
    const preferences = useDishPreferences(new MemoryStorage(), validIds)

    preferences.toggleLike('tomato-eggs')
    expect(preferences.isLiked('tomato-eggs')).toBe(true)
    expect(preferences.rules.value.likedIds.has('tomato-eggs')).toBe(true)

    preferences.toggleLike('tomato-eggs')
    expect(preferences.isLiked('tomato-eggs')).toBe(false)
  })

  it('不喜欢会覆盖喜欢，恢复后回到普通状态', () => {
    const storage = new MemoryStorage()
    const preferences = useDishPreferences(storage, validIds)

    preferences.toggleLike('pepper-pork')
    preferences.dislike('pepper-pork')

    expect(preferences.isLiked('pepper-pork')).toBe(false)
    expect(preferences.isDisliked('pepper-pork')).toBe(true)

    preferences.restore('pepper-pork')
    expect(preferences.isLiked('pepper-pork')).toBe(false)
    expect(preferences.isDisliked('pepper-pork')).toBe(false)
    expect(storage.value).toContain('dislikedIds')
  })

  it('初始化时把清理后的偏好回写存储', () => {
    const storage = new MemoryStorage()
    storage.value = JSON.stringify({
      likedIds: ['tomato-eggs', 'missing-dish', 'pepper-pork'],
      dislikedIds: ['pepper-pork'],
    })

    useDishPreferences(storage, validIds)

    expect(JSON.parse(storage.value ?? '{}')).toEqual({
      likedIds: ['tomato-eggs'],
      dislikedIds: ['pepper-pork'],
    })
  })
})
