// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from '../router'
import AppNavigation from './AppNavigation.vue'

describe('底部导航', () => {
  it('展示两个入口、偏好数量和当前页面状态', async () => {
    window.scrollTo = vi.fn()
    const router = createAppRouter(createMemoryHistory())
    await router.push('/')
    await router.isReady()
    const wrapper = mount(AppNavigation, {
      props: { preferenceCount: 3 },
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toContain('今日菜单')
    expect(links[0].attributes('aria-current')).toBe('page')
    expect(links[1].text()).toContain('3')

    await router.push('/preferences')
    await flushPromises()

    expect(links[1].attributes('aria-current')).toBe('page')
  })
})
