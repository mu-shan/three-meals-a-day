import { dishes } from '../data/dishes'
import type {
  AppBackupV1,
  BackupParseResult,
  DailyMenu,
  DishPreferences,
  Meal,
  MealType,
} from '../types/menu'

const dishById = new Map(dishes.map((dish) => [dish.id, dish]))
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner']

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

const parseMeal = (
  value: unknown,
  type: MealType,
): { ok: true; meal: Meal } | { ok: false; error: string } => {
  if (!isRecord(value) || value.type !== type || !Array.isArray(value.dishes)) {
    return { ok: false, error: `${type}餐次格式不正确` }
  }
  if (value.dishes.length === 0) {
    return { ok: false, error: `${type}餐次不能为空` }
  }

  const parsedDishes = []
  for (const item of value.dishes) {
    if (!isRecord(item) || typeof item.id !== 'string') {
      return { ok: false, error: `${type}包含无效菜品` }
    }
    const sourceDish = dishById.get(item.id)
    if (
      !sourceDish ||
      !sourceDish.meals.includes(type) ||
      item.role !== sourceDish.role ||
      item.kind !== sourceDish.kind
    ) {
      return { ok: false, error: `${type}包含不存在或不匹配的菜品` }
    }
    parsedDishes.push(sourceDish)
  }

  return { ok: true, meal: { type, dishes: parsedDishes } }
}

const parseMenu = (
  value: unknown,
): { ok: true; menu: DailyMenu } | { ok: false; error: string } => {
  if (
    !isRecord(value) ||
    typeof value.date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
  ) {
    return { ok: false, error: '菜单日期格式不正确' }
  }

  const meals = {} as Record<MealType, Meal>
  for (const type of mealTypes) {
    const parsed = parseMeal(value[type], type)
    if (!parsed.ok) return parsed
    meals[type] = parsed.meal
  }

  return { ok: true, menu: { date: value.date, ...meals } }
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
  if (
    typeof value.exportedAt !== 'string' ||
    Number.isNaN(Date.parse(value.exportedAt))
  ) {
    return { ok: false, error: '备份时间格式不正确' }
  }

  const parsedMenu = parseMenu(value.menu)
  if (!parsedMenu.ok) return parsedMenu
  const parsedPreferences = parsePreferences(value.preferences)
  if (!parsedPreferences.ok) return parsedPreferences

  return {
    ok: true,
    backup: {
      version: 1,
      exportedAt: value.exportedAt,
      menu: parsedMenu.menu,
      preferences: parsedPreferences.preferences,
    },
  }
}
