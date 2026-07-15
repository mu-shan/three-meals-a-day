import type { DishRole } from '../types/menu'

interface DishRoleMeta {
  label: string
  cardClass: string
  imageClass: string
  badgeClass: string
  legendClass: string
}

export const dishRoleMeta: Record<DishRole, DishRoleMeta> = {
  baby: {
    label: '宝宝友好',
    cardClass: 'border-baby bg-baby-soft/35',
    imageClass: 'bg-baby-soft',
    badgeClass: 'bg-baby-deep text-white',
    legendClass: 'bg-baby',
  },
  spicy: {
    label: '妈妈辣菜',
    cardClass: 'border-spicy bg-spicy-soft/30',
    imageClass: 'bg-spicy-soft',
    badgeClass: 'bg-spicy-deep text-white',
    legendClass: 'bg-spicy',
  },
  shared: {
    label: '全家共享',
    cardClass: 'border-shared bg-shared-soft/35',
    imageClass: 'bg-shared-soft',
    badgeClass: 'bg-shared-deep text-white',
    legendClass: 'bg-shared',
  },
  staple: {
    label: '今日主食',
    cardClass: 'border-sand bg-paper-soft/55',
    imageClass: 'bg-sand/55',
    badgeClass: 'bg-[#9b7335] text-white',
    legendClass: 'bg-[#9b7335]',
  },
  drink: {
    label: '蛋奶能量',
    cardClass: 'border-[#74a9a1] bg-[#d9efeb]/45',
    imageClass: 'bg-[#d9efeb]',
    badgeClass: 'bg-[#4f8d84] text-white',
    legendClass: 'bg-[#4f8d84]',
  },
  fruit: {
    label: '新鲜水果',
    cardClass: 'border-[#df8a49] bg-[#f9ddbd]/45',
    imageClass: 'bg-[#f9ddbd]',
    badgeClass: 'bg-[#c87334] text-white',
    legendClass: 'bg-[#c87334]',
  },
}
