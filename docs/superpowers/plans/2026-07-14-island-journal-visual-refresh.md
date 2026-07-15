# 岛屿手账视觉改版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有移动端三餐应用改造成成熟耐看的“岛屿手账”界面，整合 `animal-island-vue` 组件，并新增与本地时间联动的三餐进度。

**Architecture:** 保持 Router、Pinia、菜单生成和本地存储结构不变。新增纯函数时间阶段模块、`MealProgress` 和 `HomeHeader` 两个聚焦组件；现有菜单、采购清单和偏好页面改用组件库提供的容器与交互组件；将超大的主题样式拆分为基础、首页、偏好页和导航四个文件。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vue Router、Vitest、Vue Test Utils、animal-island-vue 0.2.1、Tailwind CSS 4

> **执行调整（2026-07-14）：** 用户要求视觉系统改用 Tailwind CSS 4 实现。`@tailwindcss/vite` 负责 Vite 集成，`src/styles/theme.css` 仅保留 `@theme` 设计令牌、基础可访问性规则和对组件库内部结构的必要覆盖；页面、卡片、导航和状态样式均使用模板中的 Tailwind utility class，不再拆分 `base.css`、`home.css`、`preferences.css` 和 `navigation.css`。

---

## 文件结构

### 新增

- `src/domain/mealTimeline.ts`：把当前本地时间转换为三餐完成节点和当前节点。
- `src/domain/mealTimeline.test.ts`：覆盖 `07:30`、`12:00`、`18:30` 三个边界。
- `src/components/MealProgress.vue`：只负责展示三餐时间进度。
- `src/components/MealProgress.test.ts`：验证完成、当前和全部完成状态。
- `src/components/HomeHeader.vue`：负责中文日期、问候、Time、Typewriter、进度和整日随机入口。
- `src/components/HomeHeader.test.ts`：验证时间文案、组件使用、减少动态效果和生成事件。
- `src/styles/base.css`：设计令牌、页面背景、手机画布和通用可访问性规则。
- `src/styles/home.css`：首页头部、进度、三餐、菜品、采购清单和页脚样式。
- `src/styles/preferences.css`：偏好列表、Tabs、备份恢复和空状态样式。
- `src/styles/navigation.css`：底部导航、数量徽标和反馈 Toast。

### 修改

- `src/test/animalIslandStub.ts`：补齐本次使用的组件库测试替身。
- `src/views/HomeView.vue`：接入 `HomeHeader` 和组件库 Footer，移除首屏偏好按钮。
- `src/components/MealCard.vue`：使用 Title、Divider、Card 和 Button。
- `src/components/DishCard.vue`：使用 Button 统一菜品操作。
- `src/components/ShoppingList.vue`：使用 Title、Divider、Icon 和 Collapse。
- `src/views/PreferencesView.vue`：使用 Title、Divider、Tabs 和 Footer。
- `src/components/PreferenceDishList.vue`：使用 Card 和 Button。
- `src/components/DataBackupPanel.vue`：使用 Collapse、Title、Divider 和 Button。
- `src/components/AppNavigation.vue`：使用 Icon，保持两个路由入口。
- `src/App.vue`：移除顶部横幅，保留路由、底部导航和反馈。
- `src/styles/theme.css`：改为样式聚合入口。
- `src/components/components.test.ts`：删除旧首屏测试并更新菜单、采购组件断言。
- `src/App.test.ts`：改为从底部导航进入偏好页。
- `src/views/PreferencesView.test.ts`：适配 Tabs 和折叠备份区。
- `src/components/AppNavigation.test.ts`：验证组件库 Icon 和现有路由状态。

### 删除

- `src/components/FamilyHero.vue`：由职责更清晰的 `HomeHeader.vue` 替代。

`index.html` 当前已有用户未提交的标题修改。本计划不改动、不暂存该文件。

---

### Task 1: 补齐 animal-island-vue 测试替身

**Files:**
- Modify: `src/test/animalIslandStub.ts`

- [ ] **Step 1: 扩展测试替身**

保留现有 `Button`、`Card`、`Loading` 和 `Time`，增加本次会使用的组件。`Tabs` 必须发出和真实组件一致的 `update:modelValue`；`Collapse` 必须支持展开，以便偏好页测试覆盖用户流程。

```ts
import { computed, defineComponent, h, ref } from 'vue'

export const Button = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('button', attrs, slots.default?.())
  },
})

export const Card = defineComponent({
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  },
})

export const Loading = defineComponent({
  setup() {
    return () => h('div', { 'data-animal-component': 'loading' })
  },
})

export const Time = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'animal-time', 'data-animal-component': 'time' }, [
        h('div', { class: 'animal-time__date' }, 'Tuesday Jul 14'),
        h('div', { class: 'animal-time__clock' }, '18:26'),
      ])
  },
})

export const Typewriter = defineComponent({
  props: { text: { type: String, default: '' } },
  setup(props) {
    return () => h('span', { 'data-animal-component': 'typewriter' }, props.text)
  },
})

export const Title = defineComponent({
  setup(_props, { slots }) {
    return () => h('span', { 'data-animal-component': 'title' }, slots.default?.())
  },
})

export const Divider = defineComponent({
  setup() {
    return () => h('div', { 'data-animal-component': 'divider' })
  },
})

export const Icon = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    return () => h('span', { 'data-animal-icon': props.name })
  },
})

export const Footer = defineComponent({
  props: { type: { type: String, default: 'tree' } },
  setup(props) {
    return () => h('footer', { 'data-animal-footer': props.type })
  },
})

export const Tabs = defineComponent({
  props: {
    items: { type: Array, required: true },
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        { 'data-animal-component': 'tabs' },
        (props.items as Array<{ key: string; label: string }>).map((item) =>
          h(
            'button',
            {
              'data-tab-key': item.key,
              'aria-pressed': props.modelValue === item.key,
              onClick: () => {
                emit('update:modelValue', item.key)
                emit('change', item.key)
              },
            },
            item.label,
          ),
        ),
      )
  },
})

export const Collapse = defineComponent({
  props: {
    question: { type: String, default: '' },
    defaultExpanded: { type: Boolean, default: false },
    expanded: { type: Boolean, default: undefined },
  },
  emits: ['update:expanded', 'change'],
  setup(props, { attrs, emit, slots }) {
    const internalExpanded = ref(props.defaultExpanded)
    const isExpanded = computed(() => props.expanded ?? internalExpanded.value)
    const toggle = () => {
      const next = !isExpanded.value
      internalExpanded.value = next
      emit('update:expanded', next)
      emit('change', next)
    }

    return () =>
      h('section', attrs, [
        h('button', { 'data-collapse-trigger': '', onClick: toggle }, slots.question?.() ?? props.question),
        isExpanded.value ? h('div', { 'data-collapse-content': '' }, slots.default?.()) : null,
      ])
  },
})
```

- [ ] **Step 2: 运行现有测试确认替身未破坏行为**

Run: `pnpm test -- src/App.test.ts src/components/components.test.ts src/views/PreferencesView.test.ts`

Expected: 当前测试全部 PASS。

- [ ] **Step 3: 提交测试基础设施**

```bash
git add src/test/animalIslandStub.ts
git commit -m "test: extend animal island component stubs"
```

---

### Task 2: 建立三餐时间阶段领域逻辑

**Files:**
- Create: `src/domain/mealTimeline.ts`
- Create: `src/domain/mealTimeline.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it } from 'vitest'
import { getMealProgressState } from './mealTimeline'

const at = (hour: number, minute: number) => new Date(2026, 6, 14, hour, minute)

describe('三餐时间进度', () => {
  it.each([
    [at(7, 29), [], 'breakfast'],
    [at(7, 30), ['breakfast'], 'lunch'],
    [at(12, 0), ['breakfast', 'lunch'], 'dinner'],
    [at(18, 29), ['breakfast', 'lunch'], 'dinner'],
    [at(18, 30), ['breakfast', 'lunch', 'dinner'], null],
  ] as const)('根据本地时间 %s 返回正确阶段', (now, completed, active) => {
    expect(getMealProgressState(now)).toEqual({ completed: [...completed], active })
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test -- src/domain/mealTimeline.test.ts`

Expected: FAIL，提示无法找到 `./mealTimeline`。

- [ ] **Step 3: 实现纯函数**

```ts
import type { MealType } from '../types/menu'

export interface MealProgressState {
  completed: MealType[]
  active: MealType | null
}

const BREAKFAST_MINUTES = 7 * 60 + 30
const LUNCH_MINUTES = 12 * 60
const DINNER_MINUTES = 18 * 60 + 30

/** 将本地时间映射为页面展示用的三餐阶段，不代表用户实际完成了用餐。 */
export const getMealProgressState = (now: Date): MealProgressState => {
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (minutes < BREAKFAST_MINUTES) return { completed: [], active: 'breakfast' }
  if (minutes < LUNCH_MINUTES) return { completed: ['breakfast'], active: 'lunch' }
  if (minutes < DINNER_MINUTES) {
    return { completed: ['breakfast', 'lunch'], active: 'dinner' }
  }

  return { completed: ['breakfast', 'lunch', 'dinner'], active: null }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm test -- src/domain/mealTimeline.test.ts`

Expected: 5 个用例全部 PASS。

- [ ] **Step 5: 提交领域逻辑**

```bash
git add src/domain/mealTimeline.ts src/domain/mealTimeline.test.ts
git commit -m "feat: add meal timeline state"
```

---

### Task 3: 实现 MealProgress 组件

**Files:**
- Create: `src/components/MealProgress.vue`
- Create: `src/components/MealProgress.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MealProgress from './MealProgress.vue'

describe('三餐进度组件', () => {
  it('午餐阶段标记早餐完成并把午餐设为当前节点', () => {
    const wrapper = mount(MealProgress, { props: { now: new Date(2026, 6, 14, 8, 30) } })
    const steps = wrapper.findAll('[data-meal-step]')

    expect(steps[0].classes()).toContain('is-completed')
    expect(steps[1].attributes('aria-current')).toBe('step')
    expect(steps[2].classes()).not.toContain('is-completed')
  })

  it('晚餐时间后所有节点完成且没有当前节点', () => {
    const wrapper = mount(MealProgress, { props: { now: new Date(2026, 6, 14, 18, 30) } })

    expect(wrapper.findAll('.is-completed')).toHaveLength(3)
    expect(wrapper.find('[aria-current="step"]').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test -- src/components/MealProgress.test.ts`

Expected: FAIL，提示无法找到 `MealProgress.vue`。

- [ ] **Step 3: 实现展示组件**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getMealProgressState } from '../domain/mealTimeline'
import type { MealType } from '../types/menu'

const props = defineProps<{ now: Date }>()

const steps: Array<{ key: MealType; label: string; time: string }> = [
  { key: 'breakfast', label: '早餐', time: '07:30' },
  { key: 'lunch', label: '午餐', time: '12:00' },
  { key: 'dinner', label: '晚餐', time: '18:30' },
]

const state = computed(() => getMealProgressState(props.now))
</script>

<template>
  <section class="meal-progress" aria-label="今日用餐时间进度">
    <div class="meal-progress__heading">
      <span>今日用餐进度</span>
      <span>{{ state.active ? `下一餐 · ${steps.find((step) => step.key === state.active)?.label}` : '今日三餐已到点' }}</span>
    </div>
    <ol>
      <li
        v-for="step in steps"
        :key="step.key"
        data-meal-step
        :class="{
          'is-completed': state.completed.includes(step.key),
          'is-active': state.active === step.key,
        }"
        :aria-current="state.active === step.key ? 'step' : undefined"
      >
        <i aria-hidden="true" />
        <span>{{ step.label }}</span>
        <small>{{ step.time }}</small>
      </li>
    </ol>
  </section>
</template>
```

- [ ] **Step 4: 运行组件和领域测试**

Run: `pnpm test -- src/domain/mealTimeline.test.ts src/components/MealProgress.test.ts`

Expected: 全部 PASS。

- [ ] **Step 5: 提交进度组件**

```bash
git add src/components/MealProgress.vue src/components/MealProgress.test.ts
git commit -m "feat: add daily meal progress"
```

---

### Task 4: 用 HomeHeader 重建首页首屏

**Files:**
- Create: `src/components/HomeHeader.vue`
- Create: `src/components/HomeHeader.test.ts`
- Modify: `src/views/HomeView.vue`
- Modify: `src/App.test.ts`
- Delete: `src/components/FamilyHero.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1: 为 HomeHeader 写失败测试**

测试必须覆盖固定时间、问候文本、Time/Typewriter、主操作和减少动态效果：

```ts
// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeHeader from './HomeHeader.vue'

describe('首页头部', () => {
  afterEach(() => vi.restoreAllMocks())

  it('展示中文日期、实时钟表、问候和三餐进度', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { loading: false, now: new Date(2026, 6, 14, 18, 0) },
    })

    expect(wrapper.text()).toContain('7月14日')
    expect(wrapper.text()).toContain('星期二')
    expect(wrapper.text()).toContain('傍晚好，今天也轻松吃饭')
    expect(wrapper.find('[data-animal-component="time"]').exists()).toBe(true)
    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(true)
    expect(wrapper.find('[data-meal-step]').exists()).toBe(true)
  })

  it('减少动态效果时直接展示完整问候并触发生成事件', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia
    const wrapper = mount(HomeHeader, {
      props: { loading: false, now: new Date(2026, 6, 14, 8, 0) },
    })

    expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(false)
    await wrapper.get('[data-testid="generate-menu"]').trigger('click')
    expect(wrapper.emitted('generate')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test -- src/components/HomeHeader.test.ts`

Expected: FAIL，提示无法找到 `HomeHeader.vue`。

- [ ] **Step 3: 实现 HomeHeader**

实现要求：

- `now` 是可选测试注入；未传入时每分钟更新一次本地时间。
- Typewriter 的 `speed` 为 `45`，`autoPlay` 保持默认。
- `prefers-reduced-motion` 为 true 时不挂载 Typewriter。
- 不再接收偏好数量，也不发出打开偏好页事件。

```vue
<script setup lang="ts">
import { Button, Time, Title, Typewriter } from 'animal-island-vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MealProgress from './MealProgress.vue'

const props = defineProps<{ loading: boolean; now?: Date }>()
const emit = defineEmits<{ generate: [] }>()

const currentNow = ref(props.now ?? new Date())
let timer: number | undefined

watch(
  () => props.now,
  (now) => {
    if (now) currentNow.value = now
  },
)

onMounted(() => {
  if (props.now) return
  // 每分钟同步日期、问候和三餐阶段，避免长时间打开页面后信息过期。
  timer = window.setInterval(() => {
    currentNow.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)

const greeting = computed(() => {
  const hour = currentNow.value.getHours()
  if (hour < 11) return '早上好，今天也元气开饭'
  if (hour < 14) return '中午好，慢慢吃顿好饭'
  if (hour < 18) return '下午好，晚餐也安排好啦'
  return '傍晚好，今天也轻松吃饭'
})

const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
</script>

<template>
  <header class="home-header">
    <div class="home-header__date-row">
      <p>{{ formatDate(currentNow) }}</p>
      <Time class="home-header__time" />
    </div>
    <div class="home-header__greeting">
      <Typewriter v-if="!reduceMotion" :text="greeting" :speed="45" />
      <span v-else>{{ greeting }}</span>
    </div>
    <Title class="home-header__title" size="large" color="brown">
      一家人的<br /><em>三顿饭</em>
    </Title>
    <MealProgress :now="currentNow" />
    <Button
      data-testid="generate-menu"
      class="home-header__generate"
      type="primary"
      size="large"
      block
      :loading="loading"
      :disabled="loading"
      @click="emit('generate')"
    >
      重新安排今日菜单
    </Button>
  </header>
</template>
```

- [ ] **Step 4: 更新 HomeView 和路由测试**

在 `HomeView.vue` 中：

- 删除 `useRouter`。
- 删除 `FamilyHero` 和首屏偏好按钮事件。
- 使用 `<HomeHeader :loading="menuStore.isShuffling" @generate="menuStore.generateAll" />`。
- 保留菜单、偏好 store、三餐事件和采购清单。

在 `src/App.test.ts` 的“首页口味偏好入口”用例中，从底部导航进入：

```ts
const links = wrapper.findAll('.app-navigation a')
await links[1].trigger('click')
await flushPromises()
expect(router.currentRoute.value.name).toBe('preferences')
```

从 `src/components/components.test.ts` 删除旧的 `FamilyHero` import 和“家庭顶部区”用例。删除 `src/components/FamilyHero.vue`。

- [ ] **Step 5: 运行相关测试**

Run: `pnpm test -- src/components/HomeHeader.test.ts src/App.test.ts src/components/components.test.ts`

Expected: 全部 PASS。

- [ ] **Step 6: 提交首页结构**

```bash
git add src/components/HomeHeader.vue src/components/HomeHeader.test.ts src/views/HomeView.vue src/App.test.ts src/components/components.test.ts
git rm src/components/FamilyHero.vue
git commit -m "feat: rebuild compact home header"
```

---

### Task 5: 用组件库重构三餐和采购清单

**Files:**
- Modify: `src/components/MealCard.vue`
- Modify: `src/components/DishCard.vue`
- Modify: `src/components/ShoppingList.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1: 先更新测试表达预期组件结构**

在现有餐次和采购清单用例中增加：

```ts
expect(wrapper.find('[data-animal-component="title"]').exists()).toBe(true)
expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(true)
```

采购清单用例增加：

```ts
expect(wrapper.findAll('[data-collapse-trigger]')).toHaveLength(3)
expect(wrapper.find('[data-animal-icon="icon-shopping"]').exists()).toBe(true)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test -- src/components/components.test.ts`

Expected: FAIL，缺少 Title、Divider、Collapse 和 Icon 标记。

- [ ] **Step 3: 更新 MealCard 和 DishCard**

`MealCard.vue` 导入 `Divider`、`Title`，用组件替换原生标题和虚线边框：

```vue
<div class="meal-card__header">
  <div>
    <p>{{ mealMeta[props.meal.type].kicker }} · {{ mealMeta[props.meal.type].time }}</p>
    <Title size="middle" :color="mealMeta[props.meal.type].color">
      {{ mealMeta[props.meal.type].title }}
    </Title>
  </div>
  <Button
    data-testid="reroll-meal"
    class="meal-card__reroll"
    type="default"
    size="small"
    :disabled="disabled"
    @click="emit('reroll')"
  >
    换一餐
  </Button>
</div>
<Divider type="dashed-brown" />
```

删除 `featured` prop 和午餐特殊结构，三餐只通过 `mealMeta.color` 区分。`HomeView.vue` 同时删除午餐的 `featured` 属性。

`DishCard.vue` 保留三个 `data-testid` 和 aria 文案，但把三个原生按钮改成 `Button size="small" type="default"`；不要改变事件签名。

- [ ] **Step 4: 用 Collapse 重写 ShoppingList**

```vue
<script setup lang="ts">
import { Collapse, Divider, Icon, Title } from 'animal-island-vue'
import { computed } from 'vue'
import type { IngredientCategory, ShoppingListData } from '../types/menu'

const props = defineProps<{ list: ShoppingListData }>()
const categoryMeta: Record<IngredientCategory, { label: string; color: string }> = {
  vegetables: { label: '蔬菜篮', color: 'green' },
  protein: { label: '肉蛋奶', color: 'red' },
  staples: { label: '主食柜', color: 'yellow' },
  fruit: { label: '水果摊', color: 'orange' },
}
const categories = Object.keys(categoryMeta) as IngredientCategory[]
const visibleCategories = computed(() => categories.filter((category) => props.list[category].length))
</script>

<template>
  <section class="shopping-list" aria-labelledby="shopping-list-title">
    <div class="shopping-list__heading">
      <Icon name="icon-shopping" :size="34" />
      <div>
        <p>照着买，不漏样</p>
        <Title id="shopping-list-title" size="middle" color="app-green">今日采购清单</Title>
      </div>
    </div>
    <Divider type="wave-yellow" />
    <div class="shopping-list__groups">
      <Collapse
        v-for="(category, index) in visibleCategories"
        :key="category"
        :default-expanded="index === 0"
      >
        <template #question>
          <span>{{ categoryMeta[category].label }}</span>
          <b>{{ list[category].length }} 样</b>
        </template>
        <ul>
          <li v-for="item in list[category]" :key="item">{{ item }}</li>
        </ul>
      </Collapse>
    </div>
  </section>
</template>
```

- [ ] **Step 5: 运行组件测试**

Run: `pnpm test -- src/components/components.test.ts src/App.test.ts`

Expected: 全部 PASS，事件断言保持不变。

- [ ] **Step 6: 提交三餐与采购清单**

```bash
git add src/components/MealCard.vue src/components/DishCard.vue src/components/ShoppingList.vue src/components/components.test.ts src/views/HomeView.vue
git commit -m "refactor: align menu cards with island components"
```

---

### Task 6: 重构偏好页和备份面板

**Files:**
- Modify: `src/views/PreferencesView.vue`
- Modify: `src/components/PreferenceDishList.vue`
- Modify: `src/components/DataBackupPanel.vue`
- Modify: `src/views/PreferencesView.test.ts`

- [ ] **Step 1: 更新偏好页测试**

把自定义 `data-testid="disliked-tab"` 点击改为真实 Tabs 交互语义：

```ts
await wrapper.get('[data-tab-key="disliked"]').trigger('click')
expect(wrapper.text()).toContain('西红柿炒鸡蛋')
```

备份相关两个用例在查找文件输入前先展开：

```ts
await wrapper.get('[data-testid="backup-collapse"] [data-collapse-trigger]').trigger('click')
const input = wrapper.get('[data-testid="backup-file"]')
```

增加组件断言：

```ts
expect(wrapper.find('[data-animal-component="tabs"]').exists()).toBe(true)
expect(wrapper.find('[data-animal-footer="tree"]').exists()).toBe(true)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test -- src/views/PreferencesView.test.ts`

Expected: FAIL，当前页面没有 Tabs、Collapse 和 Footer。

- [ ] **Step 3: 使用 Tabs、Title 和 Divider 重写偏好页结构**

在 `PreferencesView.vue` 中增加：

```ts
import { Divider, Footer, Tabs, Title } from 'animal-island-vue'
import { computed, ref } from 'vue'

const preferenceTabs = computed(() => [
  { key: 'liked', label: `喜欢的菜 ${preferences.likedIds.length}` },
  { key: 'disliked', label: `不喜欢的菜 ${preferences.dislikedIds.length}` },
])
```

模板使用：

```vue
<Title size="large" color="brown">家庭口味簿</Title>
<Divider type="wave-yellow" />
<Tabs v-model="activeTab" :items="preferenceTabs" leaf-animation shadow />
<PreferenceDishList
  :dishes="visibleDishes"
  :mode="activeTab"
  @action="activeTab === 'liked' ? cancelLike($event) : restoreDish($event)"
/>
<DataBackupPanel
  :menu="menuStore.menu"
  :preferences="{
    likedIds: preferences.likedIds,
    dislikedIds: preferences.dislikedIds,
  }"
  @before-export="menuStore.refreshDate()"
  @restore="restoreBackup"
/>
<p class="page-signoff">今天也要和喜欢的人，好好吃饭。</p>
<Footer type="tree" />
```

删除旧的 `preferences-book__tabs` 原生按钮。

- [ ] **Step 4: 更新列表和备份组件**

`PreferenceDishList.vue`：

- 导入 `Button` 和 `Card`。
- 每个列表项改为 `Card color="default" pattern="none"`。
- 操作改为 `Button size="small"`，保留 `cancel-like`、`restore-dish` 测试标记和事件。

`DataBackupPanel.vue`：

- 导入 `Button`、`Collapse`、`Divider`、`Title`。
- 用 `<Collapse data-testid="backup-collapse">` 包裹面板内容，默认不展开。
- question 插槽显示“数据备份与恢复”和“仅保存在你的设备里”。
- 导出、导入、确认和取消使用 Button，但现有文件读取、严格校验、原子恢复和错误文案不变。

- [ ] **Step 5: 运行偏好与备份测试**

Run: `pnpm test -- src/views/PreferencesView.test.ts src/services/appBackup.test.ts`

Expected: 全部 PASS。

- [ ] **Step 6: 提交偏好页改版**

```bash
git add src/views/PreferencesView.vue src/components/PreferenceDishList.vue src/components/DataBackupPanel.vue src/views/PreferencesView.test.ts
git commit -m "refactor: refresh preference journal interface"
```

---

### Task 7: 统一应用外壳、导航、页脚和分层样式

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/AppNavigation.vue`
- Modify: `src/components/AppNavigation.test.ts`
- Modify: `src/views/HomeView.vue`
- Modify: `src/styles/theme.css`
- Create: `src/styles/base.css`
- Create: `src/styles/home.css`
- Create: `src/styles/preferences.css`
- Create: `src/styles/navigation.css`

- [ ] **Step 1: 更新导航测试**

在现有导航测试中增加：

```ts
expect(wrapper.find('[data-animal-icon="icon-map"]').exists()).toBe(true)
expect(wrapper.find('[data-animal-icon="icon-variant"]').exists()).toBe(true)
```

- [ ] **Step 2: 运行导航测试确认失败**

Run: `pnpm test -- src/components/AppNavigation.test.ts`

Expected: FAIL，当前导航仍使用内联 SVG。

- [ ] **Step 3: 更新 App、导航和首页页脚**

`App.vue` 删除 `.top-ribbon`，保留：

```vue
<div class="app-shell">
  <RouterView />
  <AppNavigation :preference-count="preferences.preferenceCount" />
  <Transition name="preference-toast">
    <div v-if="menuStore.feedback" class="preference-toast" role="status">
      <span aria-hidden="true">✓</span>{{ menuStore.feedback }}
    </div>
  </Transition>
</div>
```

`AppNavigation.vue` 导入 `Icon`，用 `icon-map` 和 `icon-variant` 替换两个内联 SVG。保留 RouterLink、徽标和现有文案。

`HomeView.vue` 导入 `Footer`，在采购清单后追加：

```vue
<footer class="page-signoff">
  <p>今天也要和喜欢的人，好好吃饭。</p>
  <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
</footer>
<Footer type="tree" />
```

- [ ] **Step 4: 把 theme.css 改成聚合入口**

```css
@import './base.css';
@import './home.css';
@import './preferences.css';
@import './navigation.css';
```

- [ ] **Step 5: 创建 base.css**

必须包含以下设计令牌和基础约束：

```css
:root {
  color-scheme: light;
  font-family: 'PingFang SC', 'Noto Sans CJK SC', sans-serif;
  color: #49382d;
  background: #dce5da;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --paper: #fff9e4;
  --paper-soft: #f8efcf;
  --sand: #f2d482;
  --forest: #50785a;
  --forest-dark: #31533e;
  --clay: #cc6843;
  --ink: #49382d;
  --muted: #796654;
  --line: #cdbd95;
  --animal-primary-color: var(--forest);
  --animal-primary-color-hover: #628b6b;
  --animal-primary-color-active: var(--forest-dark);
  --animal-text-color: var(--ink);
  --animal-text-color-secondary: var(--muted);
  --animal-bg-color: var(--paper);
  --animal-border-radius-base: 18px;
  --animal-border-radius-lg: 24px;
}

* { box-sizing: border-box; }
html { min-width: 320px; background: #dce5da; scroll-behavior: smooth; }
body { min-width: 320px; min-height: 100vh; margin: 0; overflow-x: hidden; background: linear-gradient(145deg, #edf1e9, #d8e2d6); }
button, a { -webkit-tap-highlight-color: transparent; }
button { font: inherit; }
button:focus-visible, a:focus-visible { outline: 3px solid var(--forest-dark); outline-offset: 3px; }
#app { width: 100%; }
.app-shell {
  position: relative;
  width: min(100%, 560px);
  min-height: 100vh;
  margin: 0 auto;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  overflow: hidden;
  background:
    repeating-linear-gradient(0deg, transparent 0 31px, rgba(72, 103, 71, .045) 31px 32px),
    linear-gradient(155deg, #f8e5aa, #efd07b);
  box-shadow: 0 0 60px rgba(45, 66, 48, .18);
}
main { width: 100%; margin: 0; }
@media (min-width: 561px) { .app-shell { border-inline: 1px solid rgba(49, 83, 62, .18); } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 6: 创建 home.css**

按以下明确约束实现，不保留旧版大型插画、顶部横幅、厚描边和所有 `FamilyHero` 选择器：

- `.home-header`：`padding: 28px 17px 22px`。
- `.home-header__date-row`：左右排列中文日期和 Time。
- `.home-header__time .animal-time__date`：`display: none`；钟表使用森林绿底色。
- `.home-header__title`：最大字号 42px；`em` 使用森林深绿且不倾斜。
- `.meal-progress`：浅纸张卡片；三节点横向排列；完成节点森林绿；当前节点只有在允许动效时呼吸。
- `.home-header__generate`：整页唯一满宽主按钮，最小高度 56px。
- `.menu-board`：无厚外框，使用透明或浅纸背景。
- `.meal-grid`：单列，间距 16px。
- `.meal-card .animal-card`：2px 以下边框、轻阴影、统一结构，无 featured 上移。
- `.dish-card`：图片区 64-72px；标题和操作在 320px 下不溢出；三个操作至少 44px。
- `.shopping-list`：使用深森林绿区块和 Collapse，默认第一类展开。
- `.page-signoff`：简短文字和细分隔线。
- `.animal-footer`：不遮挡底部导航。

- [ ] **Step 7: 创建 preferences.css 和 navigation.css**

`preferences.css` 必须满足：

- `.preferences-view` 使用 14px 左右内边距。
- 标题区不再是独立大型宣传卡片。
- 统计卡为三列或两列自适应，数字使用陶土橙。
- Tabs 使用组件库叶片动效和浅色容器。
- 偏好列表 Card 使用统一纸张色与轻边框。
- 备份 Collapse 默认关闭，错误和确认预览仍有清晰对比。

`navigation.css` 必须满足：

- `.app-navigation` 固定在 560px 手机画布底部，适配 safe area。
- 两个入口各自至少 52px 高。
- 当前路由使用森林绿背景，不再旋转。
- 数量徽标使用陶土橙。
- `.preference-toast` 位于导航上方且不遮挡操作。

- [ ] **Step 8: 运行组件、路由和类型检查**

Run: `pnpm test -- src/components/AppNavigation.test.ts src/components/HomeHeader.test.ts src/components/components.test.ts src/App.test.ts src/views/PreferencesView.test.ts`

Expected: 全部 PASS。

Run: `pnpm typecheck`

Expected: 无 TypeScript 错误。

- [ ] **Step 9: 提交视觉系统**

```bash
git add src/App.vue src/components/AppNavigation.vue src/components/AppNavigation.test.ts src/views/HomeView.vue src/styles/theme.css src/styles/base.css src/styles/home.css src/styles/preferences.css src/styles/navigation.css
git commit -m "style: apply island journal visual system"
```

---

### Task 8: 全量回归与清理

**Files:**
- Modify only if verification reveals a scoped regression.

- [ ] **Step 1: 检查旧视觉残留和意外文件**

Run: `rg -n "FamilyHero|family-hero|top-ribbon|featured" src`

Expected: 无输出。

Run: `git status --short`

Expected: 只显示用户原有的 `M index.html`；不得暂存或提交该文件。

- [ ] **Step 2: 运行全量测试**

Run: `pnpm test`

Expected: 所有测试文件和用例 PASS。

- [ ] **Step 3: 运行类型检查**

Run: `pnpm typecheck`

Expected: 无错误。

- [ ] **Step 4: 检查格式和差异**

Run: `git diff --check`

Expected: 无空白错误。

Run: `git diff --stat HEAD~7..HEAD`

Expected: 变更仅涉及计划列出的组件、测试和样式；`index.html` 不在提交差异中。

- [ ] **Step 5: 处理最终验证修复并提交**

仅当以上验证暴露问题时，修改对应文件并运行失败命令。若有修复，提交：

```bash
git add -u src
git commit -m "fix: resolve island journal regressions"
```

本任务不执行 `pnpm build`，也不主动打开浏览器验证；只有用户明确要求时再进行生产构建或页面视觉验收。
