import { describe, expect, it } from 'vitest'
import { generateDailyMenu } from '../domain/menuGenerator'
import { dishes } from '../data/dishes'
import {
  createAppBackup,
  createBackupFilename,
  parseAppBackup,
  serializeAppBackup,
} from './appBackup'

const menu = generateDailyMenu('2026-07-10')
const menuIds = new Set(
  [menu.breakfast, menu.lunch, menu.dinner].flatMap((meal) =>
    meal.dishes.map((dish) => dish.id),
  ),
)
const preferences = {
  likedIds: ['tomato-eggs'],
  dislikedIds: [dishes.find((dish) => !menuIds.has(dish.id))!.id],
}

describe('本地数据备份', () => {
  it('创建带版本、时间和文件名的备份', () => {
    const backup = createAppBackup(
      menu,
      preferences,
      new Date('2026-07-10T08:00:00.000Z'),
    )

    expect(backup).toMatchObject({
      version: 1,
      exportedAt: '2026-07-10T08:00:00.000Z',
      menu,
      preferences,
    })
    expect(createBackupFilename(menu.date)).toBe(
      'three-meals-a-day-backup-2026-07-10.json',
    )
  })

  it('序列化后可解析为规范化备份', () => {
    const backup = createAppBackup(menu, preferences)

    expect(parseAppBackup(serializeAppBackup(backup))).toEqual({
      ok: true,
      backup,
    })
  })

  it('拒绝非法 JSON 与未知版本', () => {
    expect(parseAppBackup('{bad json')).toEqual({
      ok: false,
      error: '备份文件不是有效的 JSON',
    })
    expect(parseAppBackup(JSON.stringify({ version: 2 }))).toEqual({
      ok: false,
      error: '不支持这个备份版本',
    })
  })

  it('拒绝无效菜品和互相冲突的偏好', () => {
    const invalidMenu = createAppBackup(menu, preferences)
    invalidMenu.menu.breakfast.dishes[0] = {
      ...invalidMenu.menu.breakfast.dishes[0],
      id: 'missing-dish',
    }
    const conflicting = createAppBackup(menu, {
      likedIds: ['tomato-eggs'],
      dislikedIds: ['tomato-eggs'],
    })

    expect(parseAppBackup(JSON.stringify(invalidMenu))).toMatchObject({ ok: false })
    expect(parseAppBackup(JSON.stringify(conflicting))).toEqual({
      ok: false,
      error: '喜欢和不喜欢的菜不能重复',
    })
  })

  it('拒绝非法日期、菜单结构和菜单偏好冲突', () => {
    const invalidDate = createAppBackup(menu, preferences)
    invalidDate.menu.date = '2026-99-99'
    const invalidStructure = createAppBackup(menu, preferences)
    invalidStructure.menu.breakfast.dishes = [invalidStructure.menu.breakfast.dishes[2]]
    const menuConflict = createAppBackup(menu, {
      likedIds: [],
      dislikedIds: [menu.breakfast.dishes[0].id],
    })

    expect(parseAppBackup(JSON.stringify(invalidDate))).toMatchObject({ ok: false })
    expect(parseAppBackup(JSON.stringify(invalidStructure))).toMatchObject({ ok: false })
    expect(parseAppBackup(JSON.stringify(menuConflict))).toEqual({
      ok: false,
      error: '备份菜单中包含已标记不喜欢的菜',
    })
  })

  it('拒绝看似可解析但不是严格 ISO 格式的导出时间', () => {
    const backup = createAppBackup(menu, preferences)
    backup.exportedAt = '2026-07-10'

    expect(parseAppBackup(JSON.stringify(backup))).toEqual({
      ok: false,
      error: '备份时间格式不正确',
    })

    backup.exportedAt = '2026-99-99T99:99:99.999Z'
    expect(parseAppBackup(JSON.stringify(backup))).toEqual({
      ok: false,
      error: '备份时间格式不正确',
    })
  })
})
