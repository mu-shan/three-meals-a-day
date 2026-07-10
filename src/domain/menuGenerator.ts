import { BABY_RICE_DISH_IDS, dishes } from '../data/dishes'
import type {
  DailyMenu,
  Dish,
  DishPreferenceRules,
  DishRole,
  Meal,
  MealType,
} from '../types/menu'

export interface LunchOptions {
  forceStapleId?: string
  excludedIds?: ReadonlySet<string>
  preferences?: DishPreferenceRules
}

const EMPTY_PREFERENCES: DishPreferenceRules = {
  likedIds: new Set(),
  dislikedIds: new Set(),
}

const isAvailable = (
  dish: Dish,
  meal: MealType,
  excludedIds: ReadonlySet<string>,
  preferences: DishPreferenceRules,
) =>
  dish.meals.includes(meal) &&
  !excludedIds.has(dish.id) &&
  !preferences.dislikedIds.has(dish.id)

export function pickOne<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('候选池不能为空')
  }
  return items[Math.floor(Math.random() * items.length)]
}

export function pickWeighted(
  items: readonly Dish[],
  likedIds: ReadonlySet<string>,
): Dish {
  if (items.length === 0) {
    throw new Error('候选池不能为空')
  }

  const totalWeight = items.reduce(
    (total, item) => total + (likedIds.has(item.id) ? 2 : 1),
    0,
  )
  let cursor = Math.random() * totalWeight

  for (const item of items) {
    cursor -= likedIds.has(item.id) ? 2 : 1
    if (cursor < 0) return item
  }

  return items[items.length - 1]
}

function candidates(
  meal: MealType,
  role: DishRole,
  excludedIds: ReadonlySet<string>,
  preferences: DishPreferenceRules,
): Dish[] {
  return dishes.filter(
    (dish) => dish.role === role && isAvailable(dish, meal, excludedIds, preferences),
  )
}

function generationCandidates(
  meal: MealType,
  role: DishRole,
  excludedIds: ReadonlySet<string>,
  selected: Dish[],
  preferences: DishPreferenceRules,
): Dish[] {
  const selectedIds = new Set(selected.map((dish) => dish.id))
  const pool = candidates(meal, role, new Set(), preferences).filter(
    (dish) => !selectedIds.has(dish.id),
  )
  const unusedPool = pool.filter((dish) => !excludedIds.has(dish.id))

  return unusedPool.length > 0 ? unusedPool : pool
}

export function generateBreakfast(
  excludedIds: ReadonlySet<string> = new Set(),
  preferences: DishPreferenceRules = EMPTY_PREFERENCES,
): Meal {
  const staple = pickWeighted(
    generationCandidates('breakfast', 'staple', excludedIds, [], preferences),
    preferences.likedIds,
  )
  const drink = pickWeighted(
    generationCandidates('breakfast', 'drink', excludedIds, [staple], preferences),
    preferences.likedIds,
  )
  const fruit = pickWeighted(
    generationCandidates(
      'breakfast',
      'fruit',
      excludedIds,
      [staple, drink],
      preferences,
    ),
    preferences.likedIds,
  )

  return { type: 'breakfast', dishes: [staple, drink, fruit] }
}

export function generateLunch(options: LunchOptions = {}): Meal {
  const excludedIds = options.excludedIds ?? new Set<string>()
  const preferences = options.preferences ?? EMPTY_PREFERENCES
  const availableStaples = dishes.filter(
    (dish) =>
      dish.role === 'staple' &&
      dish.meals.includes('lunch') &&
      (dish.kind === 'rice' || dish.kind === 'one-bowl') &&
      !preferences.dislikedIds.has(dish.id),
  )
  const unusedStaples = availableStaples.filter((dish) => !excludedIds.has(dish.id))
  const staplePool = unusedStaples.length > 0 ? unusedStaples : availableStaples
  const forcedStaple = options.forceStapleId
    ? availableStaples.find((dish) => dish.id === options.forceStapleId)
    : undefined
  const staple = forcedStaple ?? pickWeighted(staplePool, preferences.likedIds)
  const selected = [staple]

  if (staple.kind === 'rice') {
    const availableBabyDishes = dishes.filter(
      (dish) =>
        BABY_RICE_DISH_IDS.includes(dish.id as (typeof BABY_RICE_DISH_IDS)[number]) &&
        !preferences.dislikedIds.has(dish.id),
    )
    const unusedBabyDishes = availableBabyDishes.filter(
      (dish) => !excludedIds.has(dish.id),
    )
    const babyPool = unusedBabyDishes.length > 0 ? unusedBabyDishes : availableBabyDishes
    const babyDish = pickWeighted(babyPool, preferences.likedIds)
    selected.push(babyDish)

    const spicyDish = pickWeighted(
      generationCandidates('lunch', 'spicy', excludedIds, selected, preferences),
      preferences.likedIds,
    )
    selected.push(spicyDish)

    const sharedDish = pickWeighted(
      generationCandidates('lunch', 'shared', excludedIds, selected, preferences),
      preferences.likedIds,
    )
    selected.push(sharedDish)
  } else {
    const babyDish = pickWeighted(
      generationCandidates('lunch', 'baby', excludedIds, selected, preferences),
      preferences.likedIds,
    )
    selected.push(babyDish)
    const sharedDish = pickWeighted(
      generationCandidates('lunch', 'shared', excludedIds, selected, preferences).filter(
        (dish) => !dish.spicy,
      ),
      preferences.likedIds,
    )
    selected.push(sharedDish)
  }

  return { type: 'lunch', dishes: selected }
}

export function generateDinner(
  excludedIds: ReadonlySet<string> = new Set(),
  preferences: DishPreferenceRules = EMPTY_PREFERENCES,
): Meal {
  const staple = pickWeighted(
    generationCandidates('dinner', 'staple', excludedIds, [], preferences),
    preferences.likedIds,
  )
  const selected = [staple]
  const babyDish = pickWeighted(
    generationCandidates('dinner', 'baby', excludedIds, selected, preferences),
    preferences.likedIds,
  )
  selected.push(babyDish)

  const availableSharedCount = generationCandidates(
    'dinner',
    'shared',
    excludedIds,
    selected,
    preferences,
  ).filter((dish) => !dish.spicy).length
  const extraCount = Math.min(Math.random() < 0.5 ? 1 : 2, availableSharedCount)
  for (let index = 0; index < extraCount; index += 1) {
    const sharedDish = pickWeighted(
      generationCandidates('dinner', 'shared', excludedIds, selected, preferences).filter(
        (dish) => !dish.spicy,
      ),
      preferences.likedIds,
    )
    selected.push(sharedDish)
  }

  return { type: 'dinner', dishes: selected }
}

export function generateDailyMenu(
  date: string,
  preferences: DishPreferenceRules = EMPTY_PREFERENCES,
): DailyMenu {
  const breakfast = generateBreakfast(new Set(), preferences)
  const breakfastIds = new Set(breakfast.dishes.map((dish) => dish.id))
  const lunch = generateLunch({ excludedIds: breakfastIds, preferences })
  const usedIds = new Set([
    ...breakfastIds,
    ...lunch.dishes.map((dish) => dish.id),
  ])
  const dinner = generateDinner(usedIds, preferences)

  return { date, breakfast, lunch, dinner }
}

export function reconcileDailyMenu(
  menu: DailyMenu,
  preferences: DishPreferenceRules = EMPTY_PREFERENCES,
): DailyMenu {
  const availableIds = new Set(dishes.map((dish) => dish.id))
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner']
  let nextMenu = menu

  for (const type of mealTypes) {
    const isCurrent = nextMenu[type].dishes.every(
      (dish) => availableIds.has(dish.id) && !preferences.dislikedIds.has(dish.id),
    )
    if (isCurrent) continue

    const otherIds = new Set(
      mealTypes
        .filter((mealType) => mealType !== type)
        .flatMap((mealType) => nextMenu[mealType].dishes)
        .filter(
          (dish) =>
            availableIds.has(dish.id) && !preferences.dislikedIds.has(dish.id),
        )
        .map((dish) => dish.id),
    )
    const nextMeal =
      type === 'breakfast'
        ? generateBreakfast(otherIds, preferences)
        : type === 'lunch'
          ? generateLunch({ excludedIds: otherIds, preferences })
          : generateDinner(otherIds, preferences)

    nextMenu = { ...nextMenu, [type]: nextMeal }
  }

  return nextMenu
}

function replacementCandidates(
  meal: Meal,
  target: Dish,
  excludedIds: Set<string>,
  preferences: DishPreferenceRules,
): Dish[] {
  if (
    meal.type === 'lunch' &&
    target.role === 'baby' &&
    meal.dishes.some((dish) => dish.kind === 'rice')
  ) {
    return dishes.filter(
      (dish) =>
        BABY_RICE_DISH_IDS.includes(dish.id as (typeof BABY_RICE_DISH_IDS)[number]) &&
        !excludedIds.has(dish.id) &&
        !preferences.dislikedIds.has(dish.id),
    )
  }

  return candidates(meal.type, target.role, excludedIds, preferences).filter((dish) => {
    if (target.role === 'staple') {
      return dish.kind === 'rice' || dish.kind === 'one-bowl'
    }
    return target.role !== 'shared' || !dish.spicy
  })
}

export function replaceDish(
  meal: Meal,
  dishId: string,
  preferences: DishPreferenceRules = EMPTY_PREFERENCES,
): Meal {
  const targetIndex = meal.dishes.findIndex((dish) => dish.id === dishId)
  if (targetIndex === -1) return meal

  const target = meal.dishes[targetIndex]
  const excludedIds = new Set(meal.dishes.map((dish) => dish.id))
  const pool = replacementCandidates(meal, target, excludedIds, preferences)
  if (pool.length === 0) return meal

  const nextDishes = [...meal.dishes]
  nextDishes[targetIndex] = pickWeighted(pool, preferences.likedIds)
  return { ...meal, dishes: nextDishes }
}
