// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createAppRouter } from './router'
import { useMenuStore } from './stores/menu'
import { usePreferencesStore } from './stores/preferences'

const mountApp = async (path = '/') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] } })
  return { wrapper, router }
}

describe('移动端路由应用', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.scrollTo = vi.fn()
    vi.useFakeTimers()
  })

  it('首页从 Pinia 展示当天菜单并保存喜欢状态', async () => {
    const { wrapper } = await mountApp()
    const menuStore = useMenuStore()
    const preferences = usePreferencesStore()
    const target = menuStore.menu!.breakfast.dishes[0]

    expect(wrapper.text()).toContain('一家人的三顿饭')
    await wrapper.findAll('[data-testid="like-dish"]')[0].trigger('click')

    expect(preferences.isLiked(target.id)).toBe(true)
  })

  it('从底部导航进入口味偏好页', async () => {
    const { wrapper, router } = await mountApp()

    expect(wrapper.find('[data-testid="open-preferences"]').exists()).toBe(false)
    await wrapper.findAll('.app-navigation a')[1].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('preferences')
    expect(wrapper.text()).toContain('口味偏好')
  })

  it('整桌换新时展示整页加载遮罩', async () => {
    const { wrapper } = await mountApp()
    const menuStore = useMenuStore()

    await wrapper.get('[data-testid="generate-menu"]').trigger('click')

    expect(menuStore.shuffleTarget).toEqual({ scope: 'all' })
    const overlay = wrapper.get('[data-testid="full-page-loading"]')
    expect(overlay.attributes('aria-modal')).toBe('true')
    expect(overlay.text()).toContain('正在给餐桌换新菜')

    await vi.advanceTimersByTimeAsync(420)

    expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
  })

  it('单餐和单菜换新时只展示局部加载状态', async () => {
    const { wrapper } = await mountApp()

    const mealButton = wrapper.findAll('[data-testid="reroll-meal"]')[1]
    await mealButton.trigger('click')

    expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
    expect(mealButton.attributes('aria-busy')).toBe('true')

    await vi.advanceTimersByTimeAsync(420)

    const dishButton = wrapper.findAll('[data-testid="replace-dish"]')[0]
    await dishButton.trigger('click')

    expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
    expect(dishButton.attributes('aria-busy')).toBe('true')
  })

  it('路由往返时保留同一份菜单状态', async () => {
    const { router } = await mountApp()
    const menuStore = useMenuStore()
    const ids = menuStore.menu!.lunch.dishes.map((dish) => dish.id)

    await router.push('/preferences')
    await router.push('/')

    expect(menuStore.menu!.lunch.dishes.map((dish) => dish.id)).toEqual(ids)
  })
})
