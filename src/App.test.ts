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

  it('路由往返时保留同一份菜单状态', async () => {
    const { router } = await mountApp()
    const menuStore = useMenuStore()
    const ids = menuStore.menu!.lunch.dishes.map((dish) => dish.id)

    await router.push('/preferences')
    await router.push('/')

    expect(menuStore.menu!.lunch.dishes.map((dish) => dish.id)).toEqual(ids)
  })
})
