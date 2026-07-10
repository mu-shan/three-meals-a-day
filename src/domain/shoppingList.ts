import type { DailyMenu, ShoppingListData } from '../types/menu'

export function buildShoppingList(menu: DailyMenu): ShoppingListData {
  const grouped = {
    vegetables: new Set<string>(),
    protein: new Set<string>(),
    staples: new Set<string>(),
    fruit: new Set<string>(),
  }

  for (const meal of [menu.breakfast, menu.lunch, menu.dinner]) {
    for (const dish of meal.dishes) {
      for (const item of dish.ingredients) {
        grouped[item.category].add(item.name)
      }
    }
  }

  return {
    vegetables: [...grouped.vegetables].sort((left, right) =>
      left.localeCompare(right, 'zh-CN'),
    ),
    protein: [...grouped.protein].sort((left, right) =>
      left.localeCompare(right, 'zh-CN'),
    ),
    staples: [...grouped.staples].sort((left, right) =>
      left.localeCompare(right, 'zh-CN'),
    ),
    fruit: [...grouped.fruit].sort((left, right) =>
      left.localeCompare(right, 'zh-CN'),
    ),
  }
}
