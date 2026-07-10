# 菜品口味偏好实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增加可持久化的喜欢/不喜欢菜品管理，让随机菜单过滤不喜欢菜、以两倍权重抽取喜欢菜，并从菜单中移除鲜肉小馄饨。

**Architecture:** 偏好存储、响应式状态、菜单生成和界面展示各自独立。菜单生成器只接收只读偏好集合并统一过滤、加权；组件只通过 props 和事件通信，由 `App.vue` 负责即时换菜和反馈。

**Tech Stack:** Vue 3、TypeScript、Vitest、Vue Test Utils、浏览器 `localStorage`

---

### Task 1：偏好类型与持久化

**Files:**
- Modify: `src/types/menu.ts`
- Create: `src/services/dishPreferenceStorage.ts`
- Create: `src/services/dishPreferenceStorage.test.ts`

- [ ] **Step 1：写偏好存储失败测试**

覆盖空存储、保存后恢复、损坏 JSON、过滤不存在的菜品 ID、存储抛错五种情况。测试使用只实现 `getItem` 和 `setItem` 的内存存储，不依赖真实浏览器。

```ts
expect(loadDishPreferences(storage, validIds)).toEqual({ likedIds: [], dislikedIds: [] })
expect(saveDishPreferences(storage, preferences)).toBe(true)
expect(loadDishPreferences(storage, validIds)).toEqual(preferences)
expect(loadDishPreferences(storageWithUnknownIds, validIds)).toEqual({
  likedIds: ['tomato-eggs'],
  dislikedIds: [],
})
```

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/services/dishPreferenceStorage.test.ts`

Expected: FAIL，提示 `dishPreferenceStorage` 模块或导出不存在。

- [ ] **Step 3：实现类型和存储模块**

在 `src/types/menu.ts` 增加：

```ts
export interface DishPreferences {
  likedIds: string[]
  dislikedIds: string[]
}

export interface DishPreferenceRules {
  likedIds: ReadonlySet<string>
  dislikedIds: ReadonlySet<string>
}
```

`dishPreferenceStorage.ts` 使用固定键 `family-meal-picker:preferences`，读取时只保留字符串、有效菜品 ID，并让不喜欢状态优先于喜欢状态。所有存储异常返回空偏好或 `false`。

- [ ] **Step 4：运行偏好存储测试**

Run: `pnpm test src/services/dishPreferenceStorage.test.ts`

Expected: PASS。

### Task 2：偏好响应式状态

**Files:**
- Create: `src/composables/useDishPreferences.ts`
- Create: `src/composables/useDishPreferences.test.ts`

- [ ] **Step 1：写状态行为失败测试**

验证喜欢开关、不喜欢覆盖喜欢、恢复为普通状态、固定集合输出和保存调用结果。核心断言：

```ts
preferences.toggleLike('tomato-eggs')
expect(preferences.isLiked('tomato-eggs')).toBe(true)

preferences.dislike('tomato-eggs')
expect(preferences.isLiked('tomato-eggs')).toBe(false)
expect(preferences.isDisliked('tomato-eggs')).toBe(true)

preferences.restore('tomato-eggs')
expect(preferences.isDisliked('tomato-eggs')).toBe(false)
```

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/composables/useDishPreferences.test.ts`

Expected: FAIL，提示组合式函数不存在。

- [ ] **Step 3：实现组合式函数**

组合式函数接收存储对象和有效菜品 ID，暴露 `likedIds`、`dislikedIds`、`rules`、`isLiked`、`isDisliked`、`toggleLike`、`dislike`、`restore`。每次修改创建新数组并调用存储模块，确保 Vue 能追踪状态变化。

- [ ] **Step 4：运行组合式函数测试**

Run: `pnpm test src/composables/useDishPreferences.test.ts`

Expected: PASS。

### Task 3：菜单候选过滤与两倍加权

**Files:**
- Modify: `src/domain/menuGenerator.ts`
- Modify: `src/domain/menuGenerator.test.ts`

- [ ] **Step 1：写生成器失败测试**

新增测试验证：

```ts
const rules = {
  likedIds: new Set(['tomato-eggs']),
  dislikedIds: new Set(['shredded-potato', 'wonton']),
}

expect(generateLunch({ forceStapleId: 'steamed-rice', preferences: rules })
  .dishes.some((dish) => rules.dislikedIds.has(dish.id))).toBe(false)
```

使用 `vi.spyOn(Math, 'random').mockReturnValue(0.4)` 对两个候选执行加权抽样，证明普通权重 `1`、喜欢权重 `2` 时会选择喜欢菜。另验证 `replaceDish` 不会换到不喜欢菜。

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/domain/menuGenerator.test.ts`

Expected: FAIL，生成 API 尚未接收偏好规则，或仍抽中被屏蔽菜。

- [ ] **Step 3：实现统一过滤和加权抽样**

为候选函数增加偏好参数，先过滤 `dislikedIds`，再由以下逻辑抽样：

```ts
export function pickWeighted(
  items: readonly Dish[],
  likedIds: ReadonlySet<string>,
): Dish {
  const totalWeight = items.reduce(
    (total, item) => total + (likedIds.has(item.id) ? 2 : 1),
    0,
  )
  let cursor = Math.random() * totalWeight
  for (const item of items) {
    cursor -= likedIds.has(item.id) ? 2 : 1
    if (cursor < 0) return item
  }
  return items[items.length - 1]
}
```

`generateBreakfast`、`generateLunch`、`generateDinner`、`generateDailyMenu` 和 `replaceDish` 全部传递同一份规则。空偏好保持现有调用兼容。

- [ ] **Step 4：运行生成器测试**

Run: `pnpm test src/domain/menuGenerator.test.ts`

Expected: PASS。

### Task 4：移除馄饨并清理旧菜单

**Files:**
- Modify: `src/data/dishes.ts`
- Modify: `src/domain/menuGenerator.ts`
- Modify: `src/domain/menuGenerator.test.ts`

- [ ] **Step 1：写旧菜单修复失败测试**

构造包含历史 `wonton` 菜品对象的当天菜单，调用 `reconcileDailyMenu` 后断言菜单不含 `wonton`，餐次和主食角色仍然有效；再构造包含不喜欢菜的菜单并断言它被替换。

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/domain/menuGenerator.test.ts`

Expected: FAIL，`reconcileDailyMenu` 尚不存在。

- [ ] **Step 3：实现旧菜单修复并删除馄饨数据**

删除 `src/data/dishes.ts` 中 `id: 'wonton'` 的菜品。新增 `reconcileDailyMenu(menu, preferences)`：识别数据源中不存在或已被屏蔽的菜，先按原角色调用 `replaceDish`；无法替换时按餐次重新生成，并排除其他餐已使用的菜品。

- [ ] **Step 4：运行生成器测试**

Run: `pnpm test src/domain/menuGenerator.test.ts`

Expected: PASS。

### Task 5：菜品卡偏好操作

**Files:**
- Modify: `src/components/DishCard.vue`
- Modify: `src/components/MealCard.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1：写组件失败测试**

验证菜品卡收到 `liked` 后高亮喜欢按钮，点击喜欢和不喜欢分别发出菜品 ID；验证餐次卡把状态传给每张菜品卡并向上转发事件。

```ts
expect(wrapper.get('[data-testid="like-dish"]').attributes('aria-pressed')).toBe('true')
await wrapper.get('[data-testid="dislike-dish"]').trigger('click')
expect(wrapper.emitted('dislike')).toEqual([['pepper-pork']])
```

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/components/components.test.ts`

Expected: FAIL，偏好按钮或事件不存在。

- [ ] **Step 3：实现菜品卡和餐次卡事件**

`DishCard` 新增 `liked` prop、`like` 与 `dislike` 事件；按钮使用 `aria-pressed`、明确的 `aria-label` 和独立 `data-testid`。`MealCard` 接收 `likedIds: ReadonlySet<string>` 并转发事件，不读取存储。

- [ ] **Step 4：运行组件测试**

Run: `pnpm test src/components/components.test.ts`

Expected: PASS。

### Task 6：偏好抽屉

**Files:**
- Create: `src/components/DishPreferenceDrawer.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1：写抽屉失败测试**

验证关闭、标签页切换、空状态、取消喜欢和重新加入事件；列表项显示菜名和自动归属标签。

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/components/components.test.ts`

Expected: FAIL，抽屉组件不存在。

- [ ] **Step 3：实现抽屉组件**

组件接收 `open`、`likedDishes`、`dislikedDishes`，发出 `close`、`cancel-like`、`restore`。通过 `role` 映射出宝宝、妈妈、全家标签；打开时监听 `Escape`，关闭或卸载时移除监听。

- [ ] **Step 4：运行组件测试**

Run: `pnpm test src/components/components.test.ts`

Expected: PASS。

### Task 7：应用串联与即时换菜

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/FamilyHero.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1：写顶部偏好入口失败测试**

给 `FamilyHero` 传入偏好数量，验证点击“口味偏好”发出 `open-preferences`，数量非零时显示徽标。

- [ ] **Step 2：运行测试并确认按预期失败**

Run: `pnpm test src/components/components.test.ts`

Expected: FAIL，入口不存在。

- [ ] **Step 3：串联偏好与菜单**

`App.vue` 初始化 `useDishPreferences`，用 `reconcileDailyMenu` 清理缓存菜单，并将 `rules` 传给所有生成与替换函数。点击不喜欢时先用包含目标 ID 的临时规则尝试替换：成功才保存偏好和新菜单；失败则保留原菜并显示“至少保留一道可选菜”。

喜欢操作只切换偏好并显示反馈；抽屉中的恢复与取消喜欢直接调用组合式函数。反馈区域使用 `role="status"`。

- [ ] **Step 4：运行相关测试**

Run: `pnpm test src/components/components.test.ts src/domain/menuGenerator.test.ts`

Expected: PASS。

### Task 8：视觉样式、说明与完整验证

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `README.md`

- [ ] **Step 1：实现响应式样式**

沿用现有奶油纸张、番茄红和叶绿色体系。偏好入口与主按钮形成主次关系；菜品卡操作使用紧凑图标按钮；桌面抽屉固定在右侧，手机端在底部接近全屏；添加遮罩、空状态、徽标和轻量反馈动效，并在 `prefers-reduced-motion` 下自动关闭动效。

- [ ] **Step 2：更新项目说明**

README 增加喜欢两倍权重、不喜欢硬过滤、即时换菜和偏好本地保存说明，并从规则描述中保持馄饨已移除后的实际行为。

- [ ] **Step 3：运行全部测试**

Run: `pnpm test`

Expected: 所有测试通过，无失败或未处理错误。

- [ ] **Step 4：运行类型检查**

Run: `pnpm typecheck`

Expected: 命令退出码为 `0`，无 TypeScript 或 Vue 模板类型错误。

- [ ] **Step 5：复核范围**

确认未执行 `pnpm build`、未打开浏览器、未引入路由或额外依赖，且所有改动仅围绕菜品偏好与馄饨移除。
