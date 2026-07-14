// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { dishes } from '../data/dishes'
import DishCard from './DishCard.vue'
import MealCard from './MealCard.vue'
import ShoppingList from './ShoppingList.vue'

describe('家庭菜单组件', () => {
  it('菜品卡展示偏好状态并触发换菜、喜欢和不喜欢事件', async () => {
    const dish = dishes.find((item) => item.id === 'pepper-pork')!
    const wrapper = mount(DishCard, { props: { dish, liked: true } })

    expect(wrapper.get('img').attributes('alt')).toBe('辣椒炒肉')
    expect(wrapper.text()).toContain('妈妈辣菜')
    expect(wrapper.get('[data-testid="like-dish"]').attributes('aria-pressed')).toBe('true')
    await wrapper.get('[data-testid="replace-dish"]').trigger('click')
    await wrapper.get('[data-testid="like-dish"]').trigger('click')
    await wrapper.get('[data-testid="dislike-dish"]').trigger('click')
    expect(wrapper.emitted('replace')).toEqual([['pepper-pork']])
    expect(wrapper.emitted('like')).toEqual([['pepper-pork']])
    expect(wrapper.emitted('dislike')).toEqual([['pepper-pork']])
  })

  it('菜品图片失败后切换到本地占位图', async () => {
    const dish = dishes.find((item) => item.id === 'tomato-eggs')!
    const wrapper = mount(DishCard, { props: { dish } })

    await wrapper.get('img').trigger('error')
    expect(wrapper.get('img').attributes('src')).not.toBe(dish.image)
    expect(wrapper.get('img').attributes('src')).toContain('data:image/svg+xml')
  })

  it('餐次卡展示菜品并向上转发换桌与换菜事件', async () => {
    const meal = {
      type: 'lunch' as const,
      dishes: [dishes.find((item) => item.id === 'steamed-rice')!],
    }
    const wrapper = mount(MealCard, {
      props: { meal, likedIds: new Set(['steamed-rice']) },
    })

    expect(wrapper.text()).toContain('午餐')
    expect(wrapper.text()).toContain('香喷喷米饭')
    expect(wrapper.find('[data-animal-component="title"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(true)
    await wrapper.get('[data-testid="reroll-meal"]').trigger('click')
    await wrapper.get('[data-testid="replace-dish"]').trigger('click')
    await wrapper.get('[data-testid="like-dish"]').trigger('click')
    await wrapper.get('[data-testid="dislike-dish"]').trigger('click')
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
