// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MealProgress from './MealProgress.vue'

describe('三餐进度组件', () => {
  it('午餐阶段标记早餐完成并把午餐设为当前节点', () => {
    const wrapper = mount(MealProgress, {
      props: { now: new Date(2026, 6, 14, 8, 30) },
    })
    const steps = wrapper.findAll('[data-meal-step]')

    expect(steps[0].classes()).toContain('is-completed')
    expect(steps[1].attributes('aria-current')).toBe('step')
    expect(steps[2].classes()).not.toContain('is-completed')
  })

  it('晚餐时间后所有节点完成且没有当前节点', () => {
    const wrapper = mount(MealProgress, {
      props: { now: new Date(2026, 6, 14, 18, 30) },
    })

    expect(wrapper.findAll('.is-completed')).toHaveLength(3)
    expect(wrapper.find('[aria-current="step"]').exists()).toBe(false)
  })
})
