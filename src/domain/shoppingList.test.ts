import { describe, expect, it } from 'vitest'
import { dishes } from '../data/dishes'
import type { DailyMenu, Dish } from '../types/menu'
import { buildShoppingList } from './shoppingList'

const getDish = (id: string): Dish => {
  const dish = dishes.find((item) => item.id === id)
  if (!dish) throw new Error(`测试菜品不存在：${id}`)
  return dish
}

const menuFixture: DailyMenu = {
  date: '2026-07-10',
  breakfast: {
    type: 'breakfast',
    dishes: [getDish('egg-pancake'), getDish('warm-milk'), getDish('banana')],
  },
  lunch: {
    type: 'lunch',
    dishes: [getDish('steamed-rice'), getDish('tomato-eggs'), getDish('pepper-pork')],
  },
  dinner: {
    type: 'dinner',
    dishes: [getDish('steamed-rice'), getDish('spinach-egg-soup')],
  },
}

describe('采购清单', () => {
  it('合并同名食材并按分类汇总', () => {
    const result = buildShoppingList(menuFixture)

    expect(result.vegetables.map((item) => item.name)).toEqual(
      expect.arrayContaining(['西红柿', '辣椒', '菠菜']),
    )
    expect(result.protein.map((item) => item.name)).toEqual(
      expect.arrayContaining(['鸡蛋', '牛奶', '猪肉']),
    )
    expect(result.protein.filter((item) => item.name === '鸡蛋')).toHaveLength(1)
    expect(result.staples.filter((item) => item.name === '大米')).toHaveLength(1)
    expect(result.fruit).toEqual([{ name: '香蕉', mealTypes: ['breakfast'] }])
  })

  it('同名食材保留所有使用它的餐次来源', () => {
    const result = buildShoppingList(menuFixture)

    expect(result.protein.find((item) => item.name === '鸡蛋')?.mealTypes).toEqual([
      'breakfast',
      'lunch',
      'dinner',
    ])
    expect(result.staples.find((item) => item.name === '大米')?.mealTypes).toEqual([
      'lunch',
      'dinner',
    ])
  })

  it('每个分类按中文名称排序以保持展示稳定', () => {
    const result = buildShoppingList(menuFixture)

    expect(result.vegetables.map((item) => item.name)).toEqual(
      result.vegetables
        .map((item) => item.name)
        .sort((left, right) => left.localeCompare(right, 'zh-CN')),
    )
  })
})
