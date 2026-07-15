import type {
  DailyMenu,
  IngredientCategory,
  MealType,
  ShoppingListData,
  ShoppingListItem,
} from '../types/menu'

const toShoppingItems = (items: Map<string, Set<MealType>>): ShoppingListItem[] =>
  [...items.entries()]
    .map(([name, mealTypes]) => ({ name, mealTypes: [...mealTypes] }))
    .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))

// 全日同名食材只保留一项，同时记录它会用于哪些餐次。
export function buildShoppingList(menu: DailyMenu): ShoppingListData {
  const grouped: Record<IngredientCategory, Map<string, Set<MealType>>> = {
    vegetables: new Map(),
    protein: new Map(),
    staples: new Map(),
    fruit: new Map(),
  }

  for (const meal of [menu.breakfast, menu.lunch, menu.dinner]) {
    for (const dish of meal.dishes) {
      for (const item of dish.ingredients) {
        const mealTypes = grouped[item.category].get(item.name)

        if (mealTypes) {
          mealTypes.add(meal.type)
        } else {
          grouped[item.category].set(item.name, new Set([meal.type]))
        }
      }
    }
  }

  return {
    vegetables: toShoppingItems(grouped.vegetables),
    protein: toShoppingItems(grouped.protein),
    staples: toShoppingItems(grouped.staples),
    fruit: toShoppingItems(grouped.fruit),
  }
}
