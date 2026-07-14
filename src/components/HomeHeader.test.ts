// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeHeader from './HomeHeader.vue'

describe('首页头部', () => {
  afterEach(() => vi.restoreAllMocks())

  it('展示中文日期、实时钟表、问候和三餐进度', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { loading: false, now: new Date(2026, 6, 14, 18, 0) },
    })

    expect(wrapper.text()).toContain('7月14日')
    expect(wrapper.text()).toContain('星期二')
    expect(wrapper.text()).toContain('傍晚好，今天也轻松吃饭')
    expect(wrapper.find('[data-animal-component="time"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(true)
    expect(wrapper.find('[data-meal-step]').exists()).toBe(true)
  })

  it('减少动态效果时直接展示完整问候并触发生成事件', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { loading: false, now: new Date(2026, 6, 14, 8, 0) },
    })

    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(false)
    await wrapper.get('[data-testid="generate-menu"]').trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
  })
})
