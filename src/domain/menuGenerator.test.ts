import { describe, expect, it, vi } from 'vitest'
import { BABY_RICE_DISH_IDS, dishes } from '../data/dishes'
import {
  generateBreakfast,
  generateDailyMenu,
  generateDinner,
  generateLunch,
  pickWeighted,
  reconcileDailyMenu,
  replaceDish,
} from './menuGenerator'

describe('菜单生成规则', () => {
  it('早餐固定包含主食、蛋奶饮品和水果', () => {
    for (let index = 0; index < 50; index += 1) {
      const breakfast = generateBreakfast()
      expect(breakfast.dishes).toHaveLength(3)
      expect(breakfast.dishes.map((dish) => dish.role).sort()).toEqual(
        ['drink', 'fruit', 'staple'].sort(),
      )
      expect(breakfast.dishes.every((dish) => dish.babyFriendly)).toBe(true)
    }
  })

  it('米饭午餐至少三道菜且包含宝宝三选一和妈妈辣菜', () => {
    for (let index = 0; index < 100; index += 1) {
      const lunch = generateLunch({ forceStapleId: 'steamed-rice' })
      const sides = lunch.dishes.filter((dish) => dish.kind !== 'rice')
      const ids = lunch.dishes.map((dish) => dish.id)

      expect(sides.length).toBeGreaterThanOrEqual(3)
      expect(
        sides.filter((dish) => BABY_RICE_DISH_IDS.includes(dish.id as never)),
      ).toHaveLength(1)
      expect(sides.some((dish) => dish.role === 'spicy' && dish.spicy)).toBe(true)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('一餐式午餐搭配宝宝菜和非辣共享菜且不强制辣菜', () => {
    const lunch = generateLunch({ forceStapleId: 'pork-dumplings' })

    expect(lunch.dishes).toHaveLength(3)
    expect(lunch.dishes.some((dish) => dish.role === 'baby')).toBe(true)
    expect(lunch.dishes.some((dish) => dish.role === 'shared')).toBe(true)
    expect(lunch.dishes.some((dish) => dish.role === 'spicy')).toBe(false)
  })

  it('所有随机候选都会过滤不喜欢的菜', () => {
    const preferences = {
      likedIds: new Set<string>(),
      dislikedIds: new Set(['shredded-potato', 'stir-fried-sprouts']),
    }

    for (let index = 0; index < 30; index += 1) {
      const lunch = generateLunch({
        forceStapleId: 'steamed-rice',
        preferences,
      })

      expect(lunch.dishes.some((dish) => preferences.dislikedIds.has(dish.id))).toBe(false)
      expect(lunch.dishes.some((dish) => dish.id === 'tomato-eggs')).toBe(true)
    }
  })

  it('喜欢的菜使用固定两倍权重', () => {
    const normalDish = dishes.find((dish) => dish.id === 'tomato-eggs')!
    const likedDish = dishes.find((dish) => dish.id === 'shredded-potato')!
    vi.spyOn(Math, 'random').mockReturnValue(0.4)

    expect(pickWeighted([normalDish, likedDish], new Set([likedDish.id]))).toBe(likedDish)

    vi.restoreAllMocks()
  })

  it('晚餐包含主食、宝宝菜和两到三道菜或汤', () => {
    for (let index = 0; index < 50; index += 1) {
      const dinner = generateDinner()
      const nonStaples = dinner.dishes.filter((dish) => dish.role !== 'staple')

      expect(dinner.dishes.some((dish) => dish.role === 'staple')).toBe(true)
      expect(dinner.dishes.some((dish) => dish.babyFriendly)).toBe(true)
      expect(nonStaples.length).toBeGreaterThanOrEqual(2)
      expect(nonStaples.length).toBeLessThanOrEqual(3)
      expect(dinner.dishes.some((dish) => dish.role === 'spicy')).toBe(false)
    }
  })

  it('晚餐共享菜只剩一道时仍能生成合法菜单', () => {
    const dinnerShared = dishes.filter(
      (dish) => dish.meals.includes('dinner') && dish.role === 'shared',
    )
    const allowedDish = dinnerShared[0]
    const preferences = {
      likedIds: new Set<string>(),
      dislikedIds: new Set(dinnerShared.slice(1).map((dish) => dish.id)),
    }
    vi.spyOn(Math, 'random').mockReturnValue(0.9)

    const dinner = generateDinner(new Set(), preferences)

    expect(dinner.dishes.filter((dish) => dish.role === 'shared')).toEqual([allowedDish])
    expect(dinner.dishes.some((dish) => preferences.dislikedIds.has(dish.id))).toBe(false)
    vi.restoreAllMocks()
  })

  it('生成的一日三餐尽量避免菜品重复', () => {
    for (let index = 0; index < 30; index += 1) {
      const menu = generateDailyMenu('2026-07-10')
      const ids = [menu.breakfast, menu.lunch, menu.dinner].flatMap((meal) =>
        meal.dishes.map((dish) => dish.id),
      )

      expect(new Set(ids).size).toBe(ids.length)
      expect(menu.date).toBe('2026-07-10')
    }
  })

  it('偏好收窄候选池时允许跨餐复用菜品', () => {
    const keepIds = new Set(['steamed-rice', 'tomato-eggs', 'braised-pork'])
    const restrictedRoles = new Set(['staple', 'baby', 'shared'])
    const dislikedIds = new Set(
      dishes
        .filter(
          (dish) =>
            restrictedRoles.has(dish.role) &&
            (dish.meals.includes('lunch') || dish.meals.includes('dinner')) &&
            !keepIds.has(dish.id),
        )
        .map((dish) => dish.id),
    )

    const menu = generateDailyMenu('2026-07-10', {
      likedIds: new Set(),
      dislikedIds,
    })

    expect(menu.lunch.dishes.map((dish) => dish.id)).toEqual(
      expect.arrayContaining([...keepIds]),
    )
    expect(menu.dinner.dishes.map((dish) => dish.id)).toEqual(
      expect.arrayContaining([...keepIds]),
    )
  })

  it('恢复旧菜单时替换已移除或不喜欢的菜', () => {
    const menu = generateDailyMenu('2026-07-10')
    const wonton = {
      ...dishes.find((dish) => dish.id === 'tomato-noodles')!,
      id: 'wonton',
      name: '鲜肉小馄饨',
    }
    const dislikedDinnerDish = menu.dinner.dishes[1]
    const staleMenu = {
      ...menu,
      lunch: {
        ...menu.lunch,
        dishes: [wonton, ...menu.lunch.dishes.slice(1)],
      },
    }
    const nextMenu = reconcileDailyMenu(staleMenu, {
      likedIds: new Set(),
      dislikedIds: new Set([dislikedDinnerDish.id]),
    })

    const ids = [nextMenu.breakfast, nextMenu.lunch, nextMenu.dinner].flatMap((meal) =>
      meal.dishes.map((dish) => dish.id),
    )
    expect(ids).not.toContain('wonton')
    expect(ids).not.toContain(dislikedDinnerDish.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('单道换菜保留角色且不会与同餐菜品重复', () => {
    const lunch = generateLunch({ forceStapleId: 'steamed-rice' })
    const spicyDish = lunch.dishes.find((dish) => dish.role === 'spicy')!
    const nextLunch = replaceDish(lunch, spicyDish.id)
    const replacement = nextLunch.dishes.find((dish) => dish.role === 'spicy')!
    const ids = nextLunch.dishes.map((dish) => dish.id)

    expect(replacement.id).not.toBe(spicyDish.id)
    expect(replacement.spicy).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('米饭午餐的宝宝菜只在固定三道菜之间更换', () => {
    const lunch = generateLunch({ forceStapleId: 'steamed-rice' })
    const babyDish = lunch.dishes.find((dish) => dish.role === 'baby')!
    const nextLunch = replaceDish(lunch, babyDish.id)
    const replacement = nextLunch.dishes.find((dish) => dish.role === 'baby')!

    expect(BABY_RICE_DISH_IDS).toContain(replacement.id)
    expect(replacement.id).not.toBe(babyDish.id)
  })

  it('单道换菜不会换成不喜欢的菜', () => {
    const lunch = generateLunch({ forceStapleId: 'steamed-rice' })
    const babyDish = lunch.dishes.find((dish) => dish.role === 'baby')!
    const expectedId = BABY_RICE_DISH_IDS.find((id) => id !== babyDish.id)!
    const dislikedIds = new Set(
      BABY_RICE_DISH_IDS.filter((id) => id !== babyDish.id && id !== expectedId),
    )
    const nextLunch = replaceDish(lunch, babyDish.id, {
      likedIds: new Set(),
      dislikedIds,
    })

    expect(nextLunch.dishes.find((dish) => dish.role === 'baby')?.id).toBe(expectedId)
  })
})
