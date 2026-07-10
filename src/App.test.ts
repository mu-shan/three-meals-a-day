// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { dishes } from './data/dishes'
import { generateDailyMenu } from './domain/menuGenerator'
import {
  formatLocalDate,
  saveTodayMenu,
} from './services/todayMenuStorage'

describe('口味偏好应用流程', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  it('喜欢菜品后保存偏好并可在抽屉中查看', async () => {
    const menu = generateDailyMenu(formatLocalDate(new Date()))
    const target = menu.breakfast.dishes[0]
    saveTodayMenu(window.localStorage, menu)
    const wrapper = mount(App)

    await wrapper.findAll('[data-testid="like-dish"]')[0].trigger('click')
    await wrapper.get('[data-testid="open-preferences"]').trigger('click')

    const stored = JSON.parse(
      window.localStorage.getItem('family-meal-picker:preferences') ?? '{}',
    )
    expect(stored.likedIds).toContain(target.id)
    expect(wrapper.get('[role="dialog"]').text()).toContain(target.name)
  })

  it('不喜欢当前菜品后保存偏好并立即换菜', async () => {
    const menu = generateDailyMenu(formatLocalDate(new Date()))
    const target = menu.breakfast.dishes[0]
    saveTodayMenu(window.localStorage, menu)
    const wrapper = mount(App)

    await wrapper.findAll('[data-testid="dislike-dish"]')[0].trigger('click')
    await vi.runAllTimersAsync()
    await flushPromises()

    const stored = JSON.parse(
      window.localStorage.getItem('family-meal-picker:preferences') ?? '{}',
    )
    expect(stored.dislikedIds).toContain(target.id)
    expect(wrapper.text()).not.toContain(target.name)
  })

  it('换菜动画期间禁用菜品操作，避免偏好与菜单不同步', async () => {
    const menu = generateDailyMenu(formatLocalDate(new Date()))
    saveTodayMenu(window.localStorage, menu)
    const wrapper = mount(App)

    await wrapper.findAll('[data-testid="replace-dish"]')[0].trigger('click')

    expect(wrapper.findAll('[data-testid="dislike-dish"]')[0].attributes()).toHaveProperty(
      'disabled',
    )
    expect(wrapper.findAll('[data-testid="like-dish"]')[0].attributes()).toHaveProperty(
      'disabled',
    )
  })

  it('存储中的偏好导致无菜可选时自动恢复可用菜单', () => {
    window.localStorage.setItem(
      'family-meal-picker:preferences',
      JSON.stringify({
        likedIds: [],
        dislikedIds: dishes.map((dish) => dish.id),
      }),
    )

    expect(() => mount(App)).not.toThrow()
    const stored = JSON.parse(
      window.localStorage.getItem('family-meal-picker:preferences') ?? '{}',
    )
    expect(stored.dislikedIds).toEqual([])
  })
})
