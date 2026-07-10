import type { DishPreferences } from '../types/menu'

const STORAGE_KEY = 'family-meal-picker:preferences'

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

const emptyPreferences = (): DishPreferences => ({ likedIds: [], dislikedIds: [] })

const validStringIds = (value: unknown, validIds: ReadonlySet<string>): string[] => {
  if (!Array.isArray(value)) return []

  return [...new Set(value.filter((id): id is string =>
    typeof id === 'string' && validIds.has(id),
  ))]
}

export function loadDishPreferences(
  storage: ReadStorage,
  validIds: ReadonlySet<string>,
): DishPreferences {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyPreferences()

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const dislikedIds = validStringIds(parsed.dislikedIds, validIds)
    const dislikedSet = new Set(dislikedIds)
    const likedIds = validStringIds(parsed.likedIds, validIds).filter(
      (id) => !dislikedSet.has(id),
    )

    return { likedIds, dislikedIds }
  } catch {
    return emptyPreferences()
  }
}

export function saveDishPreferences(
  storage: WriteStorage,
  preferences: DishPreferences,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    return true
  } catch {
    return false
  }
}
