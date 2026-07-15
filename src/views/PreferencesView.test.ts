// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppBackup, serializeAppBackup } from '../services/appBackup'
import { useMenuStore } from '../stores/menu'
import { usePreferencesStore } from '../stores/preferences'
import PreferencesView from './PreferencesView.vue'

const mountView = (attachTo?: Element) =>
  mount(PreferencesView, {
    attachTo,
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
    expect(wrapper.find('[data-animal-component="tabs"]').exists()).toBe(false)
    expect(wrapper.find('[data-animal-footer="tree"]').exists()).toBe(true)

    await wrapper.get('[data-testid="cancel-like"]').trigger('click')
    expect(preferences.isLiked('pepper-pork')).toBe(false)

    await wrapper.get('[data-testid="disliked-tab"]').trigger('click')
    expect(wrapper.text()).toContain('西红柿炒鸡蛋')
    await wrapper.get('[data-testid="restore-dish"]').trigger('click')
    expect(preferences.isDisliked('tomato-eggs')).toBe(false)
  })

  it('使用标准标签页语义关联当前口味列表', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mountView(host)
    const tablist = wrapper.get('[role="tablist"]')
    const likedTab = wrapper.get('[data-testid="liked-tab"]')
    const dislikedTab = wrapper.get('[data-testid="disliked-tab"]')

    expect(tablist.attributes('aria-label')).toBe('口味偏好分类')
    expect(likedTab.attributes()).toMatchObject({
      role: 'tab',
      type: 'button',
      id: 'preferences-tab-liked',
      'aria-selected': 'true',
      'aria-controls': 'preferences-panel',
      tabindex: '0',
    })
    expect(dislikedTab.attributes()).toMatchObject({
      role: 'tab',
      type: 'button',
      id: 'preferences-tab-disliked',
      'aria-selected': 'false',
      'aria-controls': 'preferences-panel',
      tabindex: '-1',
    })

    const likedPanel = wrapper.get('[role="tabpanel"]')
    expect(likedPanel.attributes()).toMatchObject({
      id: 'preferences-panel',
      'aria-labelledby': 'preferences-tab-liked',
    })
    expect(document.querySelector('#preferences-panel')).toBe(likedPanel.element)
    expect(document.querySelectorAll('#preferences-panel')).toHaveLength(1)

    await dislikedTab.trigger('click')

    const dislikedPanel = wrapper.get('[role="tabpanel"]')
    expect(dislikedPanel.attributes()).toMatchObject({
      id: 'preferences-panel',
      'aria-labelledby': 'preferences-tab-disliked',
    })
    expect(dislikedPanel.element).toBe(likedPanel.element)
    expect(document.querySelector(`#${likedTab.attributes('aria-controls')}`)).toBe(dislikedPanel.element)
    expect(document.querySelector(`#${dislikedTab.attributes('aria-controls')}`)).toBe(dislikedPanel.element)
    expect(document.querySelectorAll('#preferences-panel')).toHaveLength(1)
    expect(likedTab.attributes('aria-selected')).toBe('false')
    expect(likedTab.attributes('tabindex')).toBe('-1')
    expect(dislikedTab.attributes('aria-selected')).toBe('true')
    expect(dislikedTab.attributes('tabindex')).toBe('0')

    const ids = wrapper.findAll('[id]').map((node) => node.attributes('id'))
    expect(new Set(ids).size).toBe(ids.length)

    wrapper.unmount()
    host.remove()
  })

  it('支持使用方向键和首尾键循环切换标签页', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mountView(host)
    const likedTab = wrapper.get('[data-testid="liked-tab"]')
    const dislikedTab = wrapper.get('[data-testid="disliked-tab"]')

    likedTab.element.focus()
    await likedTab.trigger('keydown', { key: 'ArrowRight' })
    expect(dislikedTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(dislikedTab.element)

    await dislikedTab.trigger('keydown', { key: 'ArrowRight' })
    expect(likedTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(likedTab.element)

    await likedTab.trigger('keydown', { key: 'ArrowLeft' })
    expect(dislikedTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(dislikedTab.element)

    await dislikedTab.trigger('keydown', { key: 'Home' })
    expect(likedTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(likedTab.element)

    await likedTab.trigger('keydown', { key: 'End' })
    expect(dislikedTab.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(dislikedTab.element)

    wrapper.unmount()
    host.remove()
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
    expect(wrapper.find('[data-testid="backup-collapse"]').exists()).toBe(false)
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
    expect(wrapper.find('[data-testid="backup-collapse"]').exists()).toBe(false)
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
