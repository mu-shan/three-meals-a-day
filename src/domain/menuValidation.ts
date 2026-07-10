import { BABY_RICE_DISH_IDS, dishes } from '../data/dishes'
import type { DailyMenu, Dish, Meal, MealType } from '../types/menu'

const dishById = new Map(dishes.map((dish) => [dish.id, dish]))

export const isValidLocalDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

const parseMeal = (value: unknown, type: MealType): Meal | null => {
  if (!value || typeof value !== 'object') return null
  const meal = value as Partial<Meal>
  if (meal.type !== type || !Array.isArray(meal.dishes)) return null

  const parsed: Dish[] = []
  const ids = new Set<string>()
  for (const item of meal.dishes) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string') return null
    const source = dishById.get(item.id)
    if (
      !source ||
      ids.has(source.id) ||
      !source.meals.includes(type) ||
      item.role !== source.role ||
      item.kind !== source.kind
    ) return null
    ids.add(source.id)
    parsed.push(source)
  }

  const count = (role: Dish['role']) => parsed.filter((dish) => dish.role === role).length
  if (type === 'breakfast') {
    if (parsed.length !== 3 || count('staple') !== 1 || count('drink') !== 1 || count('fruit') !== 1) return null
  } else if (type === 'lunch') {
    const staple = parsed.find((dish) => dish.role === 'staple')
    if (!staple || count('staple') !== 1) return null
    if (staple.kind === 'rice') {
      const fixedBabyCount = parsed.filter((dish) =>
        BABY_RICE_DISH_IDS.includes(dish.id as (typeof BABY_RICE_DISH_IDS)[number]),
      ).length
      if (parsed.length !== 4 || fixedBabyCount !== 1 || count('baby') !== 1 || count('spicy') !== 1 || count('shared') !== 1) return null
    } else if (parsed.length !== 3 || count('baby') !== 1 || count('shared') !== 1 || count('spicy') !== 0) return null
  } else if (
    (parsed.length !== 3 && parsed.length !== 4) ||
    count('staple') !== 1 ||
    count('baby') !== 1 ||
    count('shared') < 1 ||
    count('shared') > 2
  ) return null

  return { type, dishes: parsed }
}

export function validateDailyMenu(value: unknown): DailyMenu | null {
  if (!value || typeof value !== 'object') return null
  const menu = value as Record<string, unknown>
  if (!isValidLocalDate(menu.date)) return null
  const breakfast = parseMeal(menu.breakfast, 'breakfast')
  const lunch = parseMeal(menu.lunch, 'lunch')
  const dinner = parseMeal(menu.dinner, 'dinner')
  return breakfast && lunch && dinner
    ? { date: menu.date, breakfast, lunch, dinner }
    : null
}
