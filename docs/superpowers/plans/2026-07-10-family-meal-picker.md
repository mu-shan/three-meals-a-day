# “今天吃点啥”家庭三餐随机产品 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 构建一个适配手机与桌面端、满足宝宝与妈妈饮食约束、可随机生成三餐并自动汇总采购清单的 Vue 单页产品。

**Architecture:** 菜品数据、菜单生成规则、浏览器存储和采购清单派生逻辑保持独立；Vue 组件只消费这些模块并触发操作。页面使用 `animal-island-vue` 基础组件和自定义家庭餐桌主题，远程卡通图片失败时回退到本地 SVG 占位图。

**Tech Stack:** Vue 3、TypeScript、Vite、Vitest、animal-island-vue、CSS

---

## 文件结构

- `package.json`：依赖与开发、测试、类型检查命令。
- `vite.config.ts`：Vite 与 Vitest 配置。
- `tsconfig.json`、`tsconfig.app.json`：TypeScript 配置。
- `index.html`：应用入口。
- `src/main.ts`：挂载 Vue 应用并引入组件库样式。
- `src/App.vue`：页面状态、菜单操作和整体布局。
- `src/styles/theme.css`：全局主题、响应式布局和动画。
- `src/types/menu.ts`：菜品、餐次、菜单、采购分类等类型。
- `src/data/dishes.ts`：50 至 70 个菜品及远程卡通图片映射。
- `src/domain/menuGenerator.ts`：三餐生成、规则校验与角色安全换菜。
- `src/domain/shoppingList.ts`：从菜单派生采购清单。
- `src/services/todayMenuStorage.ts`：按日期读取和保存当天菜单。
- `src/components/FamilyHero.vue`：家庭插画、日期与一键生成按钮。
- `src/components/MealCard.vue`：单餐展示与“换一桌”。
- `src/components/DishCard.vue`：菜品图片、标签与单道换菜。
- `src/components/ShoppingList.vue`：分类采购清单。
- `src/assets/dish-placeholder.svg`：图片失败占位图。
- `src/domain/menuGenerator.test.ts`：随机组合与换菜约束测试。
- `src/domain/shoppingList.test.ts`：食材去重和分类测试。
- `src/services/todayMenuStorage.test.ts`：日期与存储降级测试。
- `README.md`：启动说明、图片来源和非商业使用提示。

## Task 1：搭建 Vue 与测试基础

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `index.html`
- Create: `src/main.ts`

- [x] **Step 1：创建依赖与脚本**

```json
{
  "name": "family-meal-picker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@vitejs/plugin-vue": "latest",
    "animal-island-vue": "latest",
    "vite": "latest",
    "vue": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "vitest": "latest",
    "vue-tsc": "latest"
  }
}
```

- [x] **Step 2：创建 Vite 与 TypeScript 配置**

```ts
// vite.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: { environment: 'node' },
})
```

```json
// tsconfig.json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "skipLibCheck": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "vite.config.ts"]
}
```

- [x] **Step 3：创建入口并安装依赖**

```ts
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import 'animal-island-vue/style'
import './styles/theme.css'

createApp(App).mount('#app')
```

Run: `pnpm install`

Expected: 依赖安装成功并生成 `pnpm-lock.yaml`。

## Task 2：定义领域类型与菜品数据

**Files:**
- Create: `src/types/menu.ts`
- Create: `src/data/dishes.ts`

- [x] **Step 1：定义稳定的领域类型**

```ts
export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type DishRole = 'staple' | 'baby' | 'spicy' | 'shared' | 'drink' | 'fruit'
export type IngredientCategory = 'vegetables' | 'protein' | 'staples' | 'fruit'

export interface Ingredient {
  name: string
  category: IngredientCategory
}

export interface Dish {
  id: string
  name: string
  meals: MealType[]
  role: DishRole
  kind: 'rice' | 'one-bowl' | 'dish' | 'soup' | 'drink' | 'fruit'
  spicy: boolean
  babyFriendly: boolean
  ingredients: Ingredient[]
  image: string
}

export interface Meal {
  type: MealType
  dishes: Dish[]
}

export interface DailyMenu {
  date: string
  breakfast: Meal
  lunch: Meal
  dinner: Meal
}
```

- [x] **Step 2：录入 50 至 70 个菜品**

数据必须包含宝宝三选一：`tomato-eggs`、`shredded-potato`、`stir-fried-sprouts`；米饭主食使用 `steamed-rice`；辣菜至少 8 道。图片使用 jsDelivr 上的 Twemoji SVG 地址，并在 README 标注来源与 CC-BY 4.0 授权。

```ts
export const dishes: Dish[] = [
  {
    id: 'tomato-eggs',
    name: '西红柿炒鸡蛋',
    meals: ['lunch', 'dinner'],
    role: 'baby',
    kind: 'dish',
    spicy: false,
    babyFriendly: true,
    ingredients: [
      { name: '西红柿', category: 'vegetables' },
      { name: '鸡蛋', category: 'protein' },
    ],
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f345.svg',
  },
]
```

## Task 3：用 TDD 实现菜单生成规则

**Files:**
- Create: `src/domain/menuGenerator.test.ts`
- Create: `src/domain/menuGenerator.ts`

- [x] **Step 1：写米饭午餐失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { generateLunch } from './menuGenerator'

describe('generateLunch', () => {
  it('米饭午餐至少三道菜且包含宝宝三选一和妈妈辣菜', () => {
    for (let i = 0; i < 100; i += 1) {
      const lunch = generateLunch({ forceStapleId: 'steamed-rice' })
      const sides = lunch.dishes.filter((dish) => dish.kind !== 'rice')
      expect(sides.length).toBeGreaterThanOrEqual(3)
      expect(sides.filter((dish) => dish.role === 'baby')).toHaveLength(1)
      expect(sides.some((dish) => dish.role === 'spicy' && dish.spicy)).toBe(true)
      expect(new Set(lunch.dishes.map((dish) => dish.id)).size).toBe(lunch.dishes.length)
    }
  })
})
```

- [x] **Step 2：运行测试并确认失败**

Run: `pnpm test -- src/domain/menuGenerator.test.ts`

Expected: FAIL，提示 `generateLunch` 不存在。

- [x] **Step 3：实现抽样器与午餐生成**

```ts
export interface LunchOptions {
  forceStapleId?: string
}

export function pickOne<T>(items: T[]): T {
  if (items.length === 0) throw new Error('候选池不能为空')
  return items[Math.floor(Math.random() * items.length)]
}

export function generateLunch(options: LunchOptions = {}): Meal {
  const staples = dishes.filter((dish) => dish.meals.includes('lunch') && ['rice', 'one-bowl'].includes(dish.kind))
  const staple = options.forceStapleId
    ? staples.find((dish) => dish.id === options.forceStapleId) ?? pickOne(staples)
    : pickOne(staples)

  if (staple.kind === 'rice') {
    return {
      type: 'lunch',
      dishes: [
        staple,
        pickOne(dishes.filter((dish) => dish.meals.includes('lunch') && dish.role === 'baby')),
        pickOne(dishes.filter((dish) => dish.meals.includes('lunch') && dish.role === 'spicy')),
        pickOne(dishes.filter((dish) => dish.meals.includes('lunch') && dish.role === 'shared')),
      ],
    }
  }

  return {
    type: 'lunch',
    dishes: [
      staple,
      pickOne(dishes.filter((dish) => dish.meals.includes('lunch') && dish.role === 'baby')),
      pickOne(dishes.filter((dish) => dish.meals.includes('lunch') && ['shared'].includes(dish.role))),
    ],
  }
}
```

- [x] **Step 4：补写早餐、晚餐、全日去重和角色换菜测试**

测试 `generateBreakfast()` 返回主食、蛋奶/饮品、水果；`generateDinner()` 返回主食和 2 至 3 道菜且至少一道宝宝菜；`replaceDish(meal, dishId)` 保留原角色并避免重复。

- [x] **Step 5：实现完整生成器并运行测试**

Run: `pnpm test -- src/domain/menuGenerator.test.ts`

Expected: 所有菜单规则测试 PASS。

## Task 4：用 TDD 实现采购清单和浏览器存储

**Files:**
- Create: `src/domain/shoppingList.test.ts`
- Create: `src/domain/shoppingList.ts`
- Create: `src/services/todayMenuStorage.test.ts`
- Create: `src/services/todayMenuStorage.ts`

- [x] **Step 1：写采购清单失败测试**

```ts
it('同名食材去重并按分类汇总', () => {
  const result = buildShoppingList(menuFixture)
  expect(result.vegetables).toContain('西红柿')
  expect(result.protein.filter((name) => name === '鸡蛋')).toHaveLength(1)
})
```

- [x] **Step 2：实现纯函数汇总器**

```ts
export type ShoppingList = Record<IngredientCategory, string[]>

export function buildShoppingList(menu: DailyMenu): ShoppingList {
  const result: ShoppingList = { vegetables: [], protein: [], staples: [], fruit: [] }
  const seen = new Set<string>()
  for (const meal of [menu.breakfast, menu.lunch, menu.dinner]) {
    for (const dish of meal.dishes) {
      for (const ingredient of dish.ingredients) {
        const key = `${ingredient.category}:${ingredient.name}`
        if (!seen.has(key)) {
          seen.add(key)
          result[ingredient.category].push(ingredient.name)
        }
      }
    }
  }
  return result
}
```

- [x] **Step 3：写存储失败测试**

测试日期一致时恢复菜单、日期不一致时返回 `null`、`localStorage` 抛错时静默降级。

- [x] **Step 4：实现存储适配器并运行测试**

```ts
const STORAGE_KEY = 'family-meal-picker:today'

export function loadTodayMenu(storage: Pick<Storage, 'getItem'>, date: string): DailyMenu | null {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const menu = JSON.parse(raw) as DailyMenu
    return menu.date === date ? menu : null
  } catch {
    return null
  }
}
```

Run: `pnpm test -- src/domain/shoppingList.test.ts src/services/todayMenuStorage.test.ts`

Expected: 两个测试文件全部 PASS。

## Task 5：实现卡通页面组件

**Files:**
- Create: `src/components/FamilyHero.vue`
- Create: `src/components/MealCard.vue`
- Create: `src/components/DishCard.vue`
- Create: `src/components/ShoppingList.vue`
- Create: `src/assets/dish-placeholder.svg`

- [x] **Step 1：实现家庭顶部区**

使用 `animal-island-vue` 的 `Button` 和 `Time`，展示一家三口卡通 emoji、日期、问候语和“一键开饭”。按钮通过 `emit('generate')` 通知父组件。

- [x] **Step 2：实现菜品卡与图片回退**

```vue
<img :src="imageSrc" :alt="dish.name" @error="imageSrc = placeholder" />
<button type="button" :aria-label="`换掉${dish.name}`" @click="$emit('replace', dish.id)">换一道</button>
```

角色标签根据 `dish.role` 显示宝宝友好、妈妈辣菜或全家共享。

- [x] **Step 3：实现单餐卡片**

`MealCard` 接收 `meal`，遍历 `DishCard`，提供“换一桌”和“换一道”事件；午餐通过 `featured` 属性增加视觉权重。

- [x] **Step 4：实现采购清单**

按蔬菜、肉蛋奶、主食、水果四组展示，空分类不渲染；使用便签式卡片而非表格。

## Task 6：整合页面状态与交互

**Files:**
- Create: `src/App.vue`

- [x] **Step 1：初始化当天菜单**

```ts
const today = formatLocalDate(new Date())
const menu = ref(loadTodayMenu(localStorage, today) ?? generateDailyMenu(today))
const shoppingList = computed(() => buildShoppingList(menu.value))
```

- [x] **Step 2：实现一键生成、换一桌与换一道**

每次操作设置短暂 `isShuffling` 状态，更新菜单后立即保存。单道换菜调用 `replaceDish`，保持菜品角色。

- [x] **Step 3：渲染完整页面**

依次渲染 `FamilyHero`、三张 `MealCard` 和 `ShoppingList`。为按钮补齐可访问名称，为结果区域使用 `aria-live="polite"`。

## Task 7：实现高质量主题与响应式布局

**Files:**
- Create: `src/styles/theme.css`

- [x] **Step 1：定义视觉令牌**

```css
:root {
  --cream: #fff4d6;
  --paper: #fffaf0;
  --leaf: #5f9b6d;
  --tomato: #e75b45;
  --sun: #f5c85b;
  --ink: #4d4538;
  --shadow: 0 10px 0 rgba(94, 108, 76, 0.14), 0 22px 44px rgba(78, 80, 54, 0.12);
  --animal-primary-color: var(--leaf);
  --animal-text-color: var(--ink);
}
```

- [x] **Step 2：实现家庭餐桌氛围**

使用柔和渐变、点状桌布纹理、漂浮蔬菜装饰、有机边框和错落卡片；字体选择 `ZCOOL KuaiLe` 作为标题，`Noto Sans SC` 作为正文，并设置可靠回退字体。

- [x] **Step 3：实现动效与响应式规则**

桌面端三列且午餐略大；小于 `900px` 改为单列。提供页面入场、菜品翻牌和按钮按压动效，并在 `prefers-reduced-motion: reduce` 下关闭非必要动画。

## Task 8：说明、验证与收尾

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/plans/2026-07-10-family-meal-picker.md`

- [x] **Step 1：编写 README**

记录 `pnpm install`、`pnpm dev`、`pnpm test`、`pnpm typecheck`，说明 Twemoji 图片来源与 CC-BY 4.0，说明 `animal-island-vue` 的非商业使用提醒。

- [x] **Step 2：运行单元测试**

Run: `pnpm test`

Expected: 所有测试 PASS。

- [x] **Step 3：运行类型检查**

Run: `pnpm typecheck`

Expected: 退出码 0，无 TypeScript 错误。

- [x] **Step 4：启动开发服务做非浏览器冒烟检查**

Run: `pnpm dev --host 127.0.0.1`

Expected: Vite 输出本地访问地址且无启动错误；确认后终止服务。不执行 `pnpm build`，不主动打开浏览器。

- [x] **Step 5：同步完成状态**

逐项勾选本计划已完成任务。由于当前目录不是 Git 仓库，不执行提交；如果用户后续要求初始化 Git，再按任务边界补充提交。
