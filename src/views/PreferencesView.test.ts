// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppBackup, serializeAppBackup } from '../services/appBackup'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'
import PreferencesView from './PreferencesView.vue'

const mountView = () =>
  mount(PreferencesView, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })

describe('口味偏好页面', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  it('展示统计并管理喜欢与不喜欢列表', async () => {
    const preferences = usePreferencesStore()
    preferences.initialize()
    preferences.replacePreferences({
      likedIds: ['pepper-pork'],
      dislikedIds: ['tomato-eggs'],
    })
    const wrapper = mountView()

    expect(wrapper.text()).toContain('家庭口味簿')
    expect(wrapper.text()).toContain('辣椒炒肉')
    expect(wrapper.text()).toContain('共记录 2 道菜')
    expect(wrapper.find('[data-animal-component="tabs"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-footer="tree"]').exists()).toBe(true)

    await wrapper.get('[data-testid="cancel-like"]').trigger('click')
    expect(preferences.isLiked('pepper-pork')).toBe(false)

    await wrapper.get('[data-tab-key="disliked"]').trigger('click')
    expect(wrapper.text()).toContain('西红柿炒鸡蛋')
    await wrapper.get('[data-testid="restore-dish"]').trigger('click')
    expect(preferences.isDisliked('tomato-eggs')).toBe(false)
  })

  it('解析备份后预览并确认恢复', async () => {
    const menuStore = useMenuStore()
    menuStore.initialize(new Date(2026, 6, 10))
    const preferences = usePreferencesStore()
    const backup = createAppBackup(menuStore.menu!, {
      likedIds: ['tomato-eggs'],
      dislikedIds: ['pepper-pork'],
    })
    const wrapper = mountView()
    await wrapper.get('[data-testid="backup-collapse"] [data-collapse-trigger]').trigger('click')
    const input = wrapper.get('[data-testid="backup-file"]')
    const file = {
      name: 'backup.json',
      text: vi.fn().mockResolvedValue(serializeAppBackup(backup)),
    }
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')
    await flushPromises()

    expect(wrapper.text()).toContain('确认恢复')
    expect(wrapper.text()).toContain('喜欢 1 道')
    expect(wrapper.text()).toContain('不喜欢 1 道')

    await wrapper.get('[data-testid="confirm-import"]').trigger('click')
    expect(preferences.likedIds).toEqual(['tomato-eggs'])
    expect(preferences.dislikedIds).toEqual(['pepper-pork'])
  })

  it('非法备份显示错误且不覆盖当前偏好', async () => {
    const preferences = usePreferencesStore()
    preferences.initialize()
    preferences.toggleLike('tomato-eggs')
    const wrapper = mountView()
    await wrapper.get('[data-testid="backup-collapse"] [data-collapse-trigger]').trigger('click')
    const input = wrapper.get('[data-testid="backup-file"]')
    const file = {
      name: 'broken.json',
      text: vi.fn().mockResolvedValue('{bad json'),
    }
    Object.defineProperty(input.element, 'files', { value: [file] })

    await input.trigger('change')
    await flushPromises()

    expect(wrapper.text()).toContain('备份文件不是有效的 JSON')
    expect(preferences.likedIds).toEqual(['tomato-eggs'])
  })
})
