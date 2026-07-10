import { describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from './index'

describe('应用路由', () => {
  it('可进入今日菜单与口味偏好页面', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('home')

    await router.push('/preferences')
    expect(router.currentRoute.value.name).toBe('preferences')
  })

  it('未知路径重定向到今日菜单', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/missing')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('home')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
