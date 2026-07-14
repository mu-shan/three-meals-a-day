import type { MealType } from '../types/menu'

const BREAKFAST_END_MINUTES = 450
const LUNCH_END_MINUTES = 720
const DINNER_END_MINUTES = 1110

export interface MealProgressState {
  completed: MealType[]
  active: MealType | null
}

/** 仅用于展示餐次时间线进度，不代表用户实际已经用餐。 */
export const getMealProgressState = (now: Date): MealProgressState => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (currentMinutes < BREAKFAST_END_MINUTES) {
    return { completed: [], active: 'breakfast' }
  }

  if (currentMinutes < LUNCH_END_MINUTES) {
    return { completed: ['breakfast'], active: 'lunch' }
  }

  if (currentMinutes < DINNER_END_MINUTES) {
    return { completed: ['breakfast', 'lunch'], active: 'dinner' }
  }

  return {
    completed: ['breakfast', 'lunch', 'dinner'],
    active: null,
  }
}
