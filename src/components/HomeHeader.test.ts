// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeHeader from './HomeHeader.vue'

describe('首页头部', () => {
  afterEach(() => vi.restoreAllMocks())

  it('展示紧凑的中文日期、问候和主行动信息', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { disabled: false, now: new Date(2026, 6, 14, 18, 0) },
    })

    expect(wrapper.text()).toContain('7月14日')
    expect(wrapper.text()).toContain('星期二')
    expect(wrapper.text()).toContain('傍晚好，今天也轻松吃饭')
    expect(wrapper.text()).toContain('今天吃点啥？')
    expect(wrapper.text()).toContain('不用再发愁')
    expect(wrapper.get('[data-testid="app-top-bar"]').text()).toContain('好好吃饭')
    expect(wrapper.get('[data-testid="date-badge"]').classes()).toContain('rounded-full')
    expect(wrapper.get('[data-testid="generate-menu-wrap"]').classes()).toContain('px-2')
    expect(wrapper.get('[data-testid="generate-menu"]').classes()).toContain('w-full!')
    expect(wrapper.get('[data-testid="generate-menu"]').classes()).toContain('text-white!')
    expect(wrapper.get('[data-testid="header-description"]').element.compareDocumentPosition(
      wrapper.get('[data-testid="header-greeting"]').element,
    )).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-component="time"]').exists()).toBe(false)
    expect(wrapper.find('[data-meal-step]').exists()).toBe(false)
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('减少动态效果时直接展示完整问候并触发生成事件', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { disabled: false, now: new Date(2026, 6, 14, 8, 0) },
    })

    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('早上好，今天也元气开饭')
    await wrapper.get('[data-testid="generate-menu"]').trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
  })
})
