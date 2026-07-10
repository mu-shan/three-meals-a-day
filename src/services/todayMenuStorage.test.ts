import { describe, expect, it } from 'vitest'
import { generateDailyMenu } from '../domain/menuGenerator'
import { formatLocalDate, loadTodayMenu, saveTodayMenu } from './todayMenuStorage'

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private value: string | null = null

  getItem() {
    return this.value
  }

  setItem(_key: string, value: string) {
    this.value = value
  }
}

describe('当天菜单存储', () => {
  it('保存后可在同一天恢复菜单', () => {
    const storage = new MemoryStorage()
    const menu = generateDailyMenu('2026-07-10')

    expect(saveTodayMenu(storage, menu)).toBe(true)
    expect(loadTodayMenu(storage, '2026-07-10')).toEqual(menu)
  })

  it('日期变化时不恢复旧菜单', () => {
    const storage = new MemoryStorage()
    saveTodayMenu(storage, generateDailyMenu('2026-07-10'))

    expect(loadTodayMenu(storage, '2026-07-11')).toBeNull()
  })

  it('存储抛错时静默降级', () => {
    const brokenStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }

    expect(loadTodayMenu(brokenStorage, '2026-07-10')).toBeNull()
    expect(saveTodayMenu(brokenStorage, generateDailyMenu('2026-07-10'))).toBe(false)
  })

  it('按本地时区格式化日期', () => {
    expect(formatLocalDate(new Date(2026, 6, 10, 8, 30))).toBe('2026-07-10')
  })
})
