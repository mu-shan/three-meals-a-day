import { dishes } from '../data/dishes'
import { validateDailyMenu } from '../domain/menuValidation'
import type {
  AppBackupV1,
  BackupParseResult,
  DailyMenu,
  DishPreferences,
} from '../types/menu'

const dishById = new Map(dishes.map((dish) => [dish.id, dish]))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const cloneMenu = (menu: DailyMenu): DailyMenu => ({
  date: menu.date,
  breakfast: { ...menu.breakfast, dishes: [...menu.breakfast.dishes] },
  lunch: { ...menu.lunch, dishes: [...menu.lunch.dishes] },
  dinner: { ...menu.dinner, dishes: [...menu.dinner.dishes] },
})

export function createAppBackup(
  menu: DailyMenu,
  preferences: DishPreferences,
  now: Date = new Date(),
): AppBackupV1 {
  return {
    version: 1,
    exportedAt: now.toISOString(),
    menu: cloneMenu(menu),
    preferences: {
      likedIds: [...preferences.likedIds],
      dislikedIds: [...preferences.dislikedIds],
    },
  }
}

export const serializeAppBackup = (backup: AppBackupV1) =>
  JSON.stringify(backup, null, 2)

export const createBackupFilename = (date: string) =>
  `three-meals-a-day-backup-${date}.json`

const parsePreferenceIds = (
  value: unknown,
  fieldName: string,
): { ok: true; ids: string[] } | { ok: false; error: string } => {
  if (!Array.isArray(value) || value.some((id) => typeof id !== 'string')) {
    return { ok: false, error: `${fieldName}格式不正确` }
  }
  const ids = value as string[]
  if (new Set(ids).size !== ids.length) {
    return { ok: false, error: `${fieldName}中有重复菜品` }
  }
  if (ids.some((id) => !dishById.has(id))) {
    return { ok: false, error: `${fieldName}中包含不存在的菜品` }
  }
  return { ok: true, ids }
}

const parsePreferences = (
  value: unknown,
): { ok: true; preferences: DishPreferences } | { ok: false; error: string } => {
  if (!isRecord(value)) return { ok: false, error: '口味偏好格式不正确' }

  const liked = parsePreferenceIds(value.likedIds, '喜欢列表')
  if (!liked.ok) return liked
  const disliked = parsePreferenceIds(value.dislikedIds, '不喜欢列表')
  if (!disliked.ok) return disliked
  const dislikedSet = new Set(disliked.ids)
  if (liked.ids.some((id) => dislikedSet.has(id))) {
    return { ok: false, error: '喜欢和不喜欢的菜不能重复' }
  }

  return {
    ok: true,
    preferences: { likedIds: liked.ids, dislikedIds: disliked.ids },
  }
}

export function parseAppBackup(raw: string): BackupParseResult {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return { ok: false, error: '备份文件不是有效的 JSON' }
  }

  if (!isRecord(value) || value.version !== 1) {
    return { ok: false, error: '不支持这个备份版本' }
  }
  if (typeof value.exportedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.exportedAt)) {
    return { ok: false, error: '备份时间格式不正确' }
  }

  const parsedMenu = validateDailyMenu(value.menu)
  if (!parsedMenu) return { ok: false, error: '备份菜单结构不正确' }
  const parsedPreferences = parsePreferences(value.preferences)
  if (!parsedPreferences.ok) return parsedPreferences
  const disliked = new Set(parsedPreferences.preferences.dislikedIds)
  const menuIds = [parsedMenu.breakfast, parsedMenu.lunch, parsedMenu.dinner]
    .flatMap((meal) => meal.dishes.map((dish) => dish.id))
  if (menuIds.some((id) => disliked.has(id))) {
    return { ok: false, error: '备份菜单中包含已标记不喜欢的菜' }
  }

  return {
    ok: true,
    backup: {
      version: 1,
      exportedAt: value.exportedAt,
      menu: parsedMenu,
      preferences: parsedPreferences.preferences,
    },
  }
}
