import type { DailyMenu } from '../types/menu'
import { validateDailyMenu } from '../domain/menuValidation'

const STORAGE_KEY = 'family-meal-picker:today'

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function loadTodayMenu(storage: ReadStorage, date: string): DailyMenu | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null

    const menu = validateDailyMenu(JSON.parse(raw))
    return menu?.date === date ? menu : null
  } catch {
    return null
  }
}

export function saveTodayMenu(storage: WriteStorage, menu: DailyMenu): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(menu))
    return true
  } catch {
    return false
  }
}
