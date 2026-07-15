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
      badgeClass: 'bg-baby',
    },
    {
      dishId: 'pepper-pork',
      role: 'spicy',
      cardClass: 'border-spicy',
      imageClass: 'bg-spicy-soft',
      badgeClass: 'bg-spicy',
    },
    {
      dishId: 'steamed-seabass',
      role: 'shared',
      cardClass: 'border-shared',
      imageClass: 'bg-shared-soft',
      badgeClass: 'bg-shared',
    },
  ])('菜品卡按 $role 角色展示纸张配色', ({ dishId, role, cardClass, imageClass, badgeClass }) => {
    const dish = dishes.find((item) => item.id === dishId)!
    const wrapper = mount(DishCard, { props: { dish } })

    expect(wrapper.get('article').attributes('data-role')).toBe(role)
    expect(wrapper.get('article').classes()).toContain(cardClass)
    expect(wrapper.get('[data-testid="dish-image-wrap"]').classes()).toContain(imageClass)
    expect(wrapper.get('[data-testid="role-label"]').classes()).toContain(badgeClass)
  })

  it('菜品卡展示偏好图形与换菜加载状态', async () => {
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
  ])('$type 餐次使用对应标题配色和分隔线', ({ type, color }) => {
    const wrapper = mount(MealCard, {
      props: {
        meal: { type, dishes: [dishes.find((item) => item.id === 'steamed-rice')!] },
      },
    })

    const title = wrapper.get('[data-animal-component="title"]')
    expect(title.attributes('size')).toBe('middle')
    expect(title.attributes('color')).toBe(color)
    expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(true)
  })

  it('餐次卡展示菜品、标记局部加载并向上转发事件', async () => {
    const meal = {
      type: 'lunch' as const,
      dishes: [dishes.find((item) => item.id === 'steamed-rice')!],
    }
    const wrapper = mount(MealCard, {
      props: {
        meal,
        likedIds: new Set(['steamed-rice']),
        loading: true,
        shufflingDishId: 'steamed-rice',
      },
    })

    expect(wrapper.text()).toContain('午餐')
    expect(wrapper.text()).toContain('香喷喷米饭')
    expect(wrapper.find('[data-animal-component="title"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="reroll-meal"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('[data-testid="replace-dish"]').attributes('aria-busy')).toBe('true')

    wrapper.getComponent('[data-testid="reroll-meal"]').vm.$emit('click')
    const dishCard = wrapper.getComponent(DishCard)
    dishCard.vm.$emit('replace', 'steamed-rice')
    dishCard.vm.$emit('like', 'steamed-rice')
    dishCard.vm.$emit('dislike', 'steamed-rice')

    expect(wrapper.emitted('reroll')).toHaveLength(1)
    expect(wrapper.emitted('replace')).toEqual([['steamed-rice']])
    expect(wrapper.emitted('like')).toEqual([['steamed-rice']])
    expect(wrapper.emitted('dislike')).toEqual([['steamed-rice']])
  })

  it('采购清单只渲染有内容的分类', () => {
    const wrapper = mount(ShoppingList, {
      props: {
        list: {
          vegetables: ['西红柿', '土豆'],
          protein: ['鸡蛋'],
          staples: [],
          fruit: ['香蕉'],
        },
      },
    })

    expect(wrapper.text()).toContain('蔬菜篮')
    expect(wrapper.text()).toContain('肉蛋奶')
    expect(wrapper.text()).toContain('水果摊')
    expect(wrapper.text()).not.toContain('主食柜')
    expect(wrapper.findAll('[data-collapse-trigger]')).toHaveLength(3)
    expect(wrapper.find('[data-animal-icon="icon-shopping"]').exists()).toBe(true)
  })
})
