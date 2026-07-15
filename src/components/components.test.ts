// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { dishes } from '../data/dishes'
import DishCard from './DishCard.vue'
import MealCard from './MealCard.vue'
import ShoppingList from './ShoppingList.vue'

describe('家庭菜单组件', () => {
  it.each([
    {
      dishId: 'tomato-eggs',
      role: 'baby',
      cardClass: 'border-baby',
      imageClass: 'bg-baby-soft',
      badgeClass: 'bg-baby-deep',
    },
    {
      dishId: 'pepper-pork',
      role: 'spicy',
      cardClass: 'border-spicy',
      imageClass: 'bg-spicy-soft',
      badgeClass: 'bg-spicy-deep',
    },
    {
      dishId: 'steamed-seabass',
      role: 'shared',
      cardClass: 'border-shared',
      imageClass: 'bg-shared-soft',
      badgeClass: 'bg-shared-deep',
    },
  ])('菜品卡按 $role 角色展示纸张配色', ({ dishId, role, cardClass, imageClass, badgeClass }) => {
    const dish = dishes.find((item) => item.id === dishId)!
    const wrapper = mount(DishCard, { props: { dish } })

    expect(wrapper.get('article').attributes('data-role')).toBe(role)
    expect(wrapper.get('article').classes()).toContain(cardClass)
    expect(wrapper.get('[data-testid="dish-image-wrap"]').classes()).toContain(imageClass)
    expect(wrapper.get('[data-testid="role-label"]').classes()).toContain(badgeClass)
  })

  it('菜品卡左侧显示小图，右侧分为信息和操作两层', () => {
    const dish = dishes.find((item) => item.id === 'tomato-eggs')!
    const wrapper = mount(DishCard, { props: { dish } })

    expect(wrapper.get('[data-testid="dish-image-wrap"]').classes()).toEqual(
      expect.arrayContaining(['row-span-2', 'w-16', 'min-[381px]:w-20']),
    )
    expect(wrapper.get('img').classes()).toEqual(
      expect.arrayContaining(['size-10', 'min-[381px]:size-12', 'object-contain']),
    )
    expect(wrapper.get('h3').classes()).not.toContain('pr-24')
    expect(wrapper.get('[data-testid="dish-actions"]').classes()).toContain('col-start-2')
    expect(wrapper.get('[data-testid="dish-actions"]').findAll('button')).toHaveLength(3)
  })

  it('菜品卡展示偏好图形与换菜加载状态', () => {
    const dish = dishes.find((item) => item.id === 'pepper-pork')!
    const wrapper = mount(DishCard, { props: { dish, liked: true, loading: true } })

    expect(wrapper.get('img').attributes('alt')).toBe('辣椒炒肉')
    expect(wrapper.text()).toContain('妈妈辣菜')
    expect(wrapper.get('[data-testid="like-dish"] [data-icon="heart"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="dislike-dish"] [data-icon="heart-off"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="like-dish"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="replace-dish"]').attributes('aria-busy')).toBe('true')
  })

  it('菜品图片失败后切换到本地占位图', async () => {
    const dish = dishes.find((item) => item.id === 'tomato-eggs')!
    const wrapper = mount(DishCard, { props: { dish } })

    await wrapper.get('img').trigger('error')
    expect(wrapper.get('img').attributes('src')).not.toBe(dish.image)
    expect(wrapper.get('img').attributes('src')).toContain('data:image/svg+xml')
  })

  it.each([
    { type: 'breakfast' as const, color: 'app-yellow' },
    { type: 'lunch' as const, color: 'app-green' },
    { type: 'dinner' as const, color: 'app-orange' },
  ])('$type 餐次使用对应标题配色', ({ type, color }) => {
    const wrapper = mount(MealCard, {
      props: {
        meal: { type, dishes: [dishes.find((item) => item.id === 'steamed-rice')!] },
      },
    })

    const title = wrapper.get('[data-animal-component="title"]')
    expect(title.attributes('size')).toBe('middle')
    expect(title.attributes('color')).toBe(color)
    const headingId = `meal-${type}-title`
    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(headingId)
    expect(wrapper.get(`#${headingId}`).element.tagName).toBe('H3')
    expect(wrapper.get(`#${headingId}`).find('[data-animal-component="title"]').exists()).toBe(
      true,
    )
    expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(false)
    const mealControls = wrapper.get('[data-testid="meal-controls"]')
    expect(mealControls.classes()).toContain('flex-col')
    const mealRoleLegend = wrapper.find('[data-testid="meal-role-legend"]')
    expect(mealRoleLegend.exists()).toBe(type === 'lunch')
    if (type === 'lunch') {
      expect(mealRoleLegend.classes()).toContain('justify-end')
      expect(mealRoleLegend.element.parentElement).toBe(mealControls.element)
    }
  })

  it('餐次卡在启用状态通过真实点击向上转发事件', async () => {
    const meal = {
      type: 'lunch' as const,
      dishes: [dishes.find((item) => item.id === 'steamed-rice')!],
    }
    const wrapper = mount(MealCard, {
      props: {
        meal,
        likedIds: new Set(['steamed-rice']),
      },
    })

    await wrapper.get('[data-testid="reroll-meal"]').trigger('click')
    await wrapper.get('[data-testid="replace-dish"]').trigger('click')
    await wrapper.get('[data-testid="like-dish"]').trigger('click')
    await wrapper.get('[data-testid="dislike-dish"]').trigger('click')

    expect(wrapper.emitted('reroll')).toHaveLength(1)
    expect(wrapper.emitted('replace')).toEqual([['steamed-rice']])
    expect(wrapper.emitted('like')).toEqual([['steamed-rice']])
    expect(wrapper.emitted('dislike')).toEqual([['steamed-rice']])
  })

  it('餐次换新时只标记换一桌按钮为忙碌', () => {
    const wrapper = mount(MealCard, {
      props: {
        meal: {
          type: 'lunch',
          dishes: [
            dishes.find((item) => item.id === 'steamed-rice')!,
            dishes.find((item) => item.id === 'pepper-pork')!,
          ],
        },
        loading: true,
      },
    })

    expect(wrapper.get('[data-testid="reroll-meal"]').attributes('aria-busy')).toBe('true')
    expect(
      wrapper
        .findAll('[data-testid="replace-dish"]')
        .map((button) => button.attributes('aria-busy')),
    ).toEqual(['false', 'false'])
  })

  it('单道换新时只标记目标菜品按钮为忙碌', () => {
    const wrapper = mount(MealCard, {
      props: {
        meal: {
          type: 'lunch',
          dishes: [
            dishes.find((item) => item.id === 'steamed-rice')!,
            dishes.find((item) => item.id === 'pepper-pork')!,
          ],
        },
        shufflingDishId: 'steamed-rice',
      },
    })

    expect(wrapper.get('[data-testid="reroll-meal"]').attributes('aria-busy')).toBe('false')
    expect(
      wrapper
        .findAll('[data-testid="replace-dish"]')
        .map((button) => button.attributes('aria-busy')),
    ).toEqual(['true', 'false'])
  })

  it('餐次禁用时所有操作按钮都不可点击', () => {
    const wrapper = mount(MealCard, {
      props: {
        meal: {
          type: 'lunch',
          dishes: [
            dishes.find((item) => item.id === 'steamed-rice')!,
            dishes.find((item) => item.id === 'pepper-pork')!,
          ],
        },
        disabled: true,
      },
    })

    expect(wrapper.findAll('button')).toHaveLength(7)
    expect(
      wrapper.findAll('button').every((button) => (button.element as HTMLButtonElement).disabled),
    ).toBe(true)
  })

  it('采购清单只渲染有内容的分类', () => {
    const wrapper = mount(ShoppingList, {
      props: {
        list: {
          vegetables: [
            { name: '西红柿', mealTypes: ['lunch', 'dinner'] },
            { name: '土豆', mealTypes: ['dinner'] },
          ],
          protein: [{ name: '鸡蛋', mealTypes: ['breakfast', 'lunch'] }],
          staples: [],
          fruit: [{ name: '香蕉', mealTypes: ['breakfast'] }],
        },
      },
    })

    expect(wrapper.text()).toContain('蔬菜篮')
    expect(wrapper.text()).toContain('肉蛋奶')
    expect(wrapper.text()).toContain('水果摊')
    expect(wrapper.text()).not.toContain('主食柜')
    const triggers = wrapper.findAll('[data-collapse-trigger]')
    expect(triggers).toHaveLength(3)
    expect(triggers[0].attributes('aria-expanded')).toBe('true')
    expect(triggers[0].find('b').text()).toBe('2')
    expect(triggers[0].find('b').classes()).toContain('mx-1.5')
    expect(wrapper.find('[data-animal-component="title"]').exists()).toBe(false)
    expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(false)
    expect(wrapper.get('#shopping-list-title').element.tagName).toBe('H2')
    expect(wrapper.get('section').attributes('aria-labelledby')).toBe('shopping-list-title')
    expect(wrapper.get('section').classes()).toContain('mt-6')
    expect(wrapper.find('[data-animal-icon="icon-shopping"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="card-corner-decoration-shopping"]').exists()).toBe(true)
    const tomatoItem = wrapper.get('[data-testid="shopping-item-西红柿"]')
    expect(tomatoItem.find('[data-meal-type="lunch"]').text()).toBe('午')
    expect(tomatoItem.find('[data-meal-type="dinner"]').text()).toBe('晚')
  })
})
