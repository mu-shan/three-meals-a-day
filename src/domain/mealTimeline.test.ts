import { describe, expect, it } from 'vitest'
import { getMealProgressState } from './mealTimeline'

describe('餐次时间线状态', () => {
  it.each([
    ['07:29', 7, 29, { completed: [], active: 'breakfast' }],
    ['07:30', 7, 30, { completed: ['breakfast'], active: 'lunch' }],
    ['12:00', 12, 0, { completed: ['breakfast', 'lunch'], active: 'dinner' }],
    ['18:29', 18, 29, { completed: ['breakfast', 'lunch'], active: 'dinner' }],
    ['18:30', 18, 30, { completed: ['breakfast', 'lunch', 'dinner'], active: null }],
  ])('%s 返回对应的展示进度', (_label, hour, minute, expected) => {
    const now = new Date(2026, 6, 14, hour, minute)

    expect(getMealProgressState(now)).toEqual(expected)
  })
})
