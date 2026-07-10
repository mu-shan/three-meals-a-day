export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type DishRole = 'staple' | 'baby' | 'spicy' | 'shared' | 'drink' | 'fruit'
export type DishKind = 'rice' | 'one-bowl' | 'dish' | 'soup' | 'drink' | 'fruit'
export type IngredientCategory = 'vegetables' | 'protein' | 'staples' | 'fruit'

export interface Ingredient {
  name: string
  category: IngredientCategory
}

export interface Dish {
  id: string
  name: string
  meals: MealType[]
  role: DishRole
  kind: DishKind
  spicy: boolean
  babyFriendly: boolean
  ingredients: Ingredient[]
  image: string
}

export interface Meal {
  type: MealType
  dishes: Dish[]
}

export interface DailyMenu {
  date: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}

export interface DishPreferences {
  likedIds: string[]
  dislikedIds: string[]
}

export interface DishPreferenceRules {
  likedIds: ReadonlySet<string>
  dislikedIds: ReadonlySet<string>
}

export interface AppBackupV1 {
  version: 1
  exportedAt: string
  menu: DailyMenu
  preferences: DishPreferences
}

export type BackupParseResult =
  | { ok: true; backup: AppBackupV1 }
  | { ok: false; error: string }

export type ShoppingListData = Record<IngredientCategory, string[]>
