# 原版布局 Tailwind 修正 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留 TailwindCSS、Typewriter、新版采购清单和现有业务能力的前提下，恢复视觉改版前有效的页面层级、角色颜色与移动端操作布局，并让随机加载只作用于真实操作范围。

**Architecture:** 菜单 store 用 `shuffleTarget` 统一描述整桌、单餐、单菜三种瞬时 UI 状态，页面只根据该状态派生 loading 与 disabled。首页沿用现有组件边界但恢复原版布局；角色颜色收口到静态 Tailwind 类映射，供图例和菜品卡复用；口味偏好页恢复原版语义结构，仅以 Tailwind 工具类重写视觉。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vue Router、TailwindCSS 4、animal-island-vue 0.2.1、Vitest、Vue Test Utils

---

## 文件职责

- `src/stores/menu.ts`：保存菜单及当前随机目标，串行执行菜单生成并在完成或异常后清空状态。
- `src/ui/dishRoleMeta.ts`：集中定义六类菜品角色的中文标签和完整静态 Tailwind 类，不在模板中拼接类名。
- `src/components/HomeHeader.vue`：恢复旧版紧凑首屏，负责日期、Typewriter 问候、标题、说明和整桌随机入口。
- `src/components/MealCard.vue`：呈现单个餐次的 `Title`、`Divider`、菜品列表和单餐 loading。
- `src/components/DishCard.vue`：呈现角色颜色、图片回退、右上角偏好按钮和右下角单菜 loading。
- `src/views/HomeView.vue`：组合首页纸张面板、角色图例、三餐、新版采购清单和页尾。
- `src/App.vue`：维持 560px 移动画布，并在整桌随机时覆盖当前视口和底部导航。
- `src/views/PreferencesView.vue`、`src/components/PreferenceDishList.vue`、`src/components/DataBackupPanel.vue`：恢复原版偏好页结构，保留原有数据与备份逻辑。
- `src/styles/theme.css`：只保留 Tailwind 主题令牌、全局基础样式和少量第三方组件适配。

### Task 1: 用随机目标替代单一 loading 状态

**Files:**
- Modify: `src/stores/menu.ts`
- Modify: `src/stores/menu.test.ts`

- [ ] **Step 1: 写三类随机目标和异常清理的失败测试**

在 `src/stores/menu.test.ts` 引入 `dishes`，并新增以下用例：

```ts
import { dishes } from '../data/dishes'

it('分别记录整桌、单餐和单菜的随机目标', async () => {
  const store = useMenuStore()
  store.initialize(testDate)
  const dishId = store.menu!.dinner.dishes[0].id

  expect(store.generateAll()).toBe(true)
  expect(store.shuffleTarget).toEqual({ scope: 'all' })
  expect(store.isShuffling).toBe(true)
  await vi.advanceTimersByTimeAsync(420)
  expect(store.shuffleTarget).toBeNull()

  expect(store.rerollMeal('lunch')).toBe(true)
  expect(store.shuffleTarget).toEqual({ scope: 'meal', mealType: 'lunch' })
  await vi.advanceTimersByTimeAsync(420)

  expect(store.rerollDish('dinner', dishId)).toBe(true)
  expect(store.shuffleTarget).toEqual({ scope: 'dish', mealType: 'dinner', dishId })
  await vi.advanceTimersByTimeAsync(420)
  expect(store.shuffleTarget).toBeNull()
})

it('随机失败后清空目标并恢复可操作状态', async () => {
  const store = useMenuStore()
  store.initialize(testDate)
  usePreferencesStore().replacePreferences({
    likedIds: [],
    dislikedIds: dishes.map((dish) => dish.id),
  })

  expect(store.generateAll()).toBe(true)
  expect(store.shuffleTarget).toEqual({ scope: 'all' })
  await vi.advanceTimersByTimeAsync(420)

  expect(store.shuffleTarget).toBeNull()
  expect(store.isShuffling).toBe(false)
  expect(store.feedback).toContain('没有足够候选')
})
```

同时把现有“不喜欢当前菜品”用例补充为：

```ts
expect(store.dislikeDish('breakfast', target.id)).toBe(true)
expect(store.shuffleTarget).toEqual({
  scope: 'dish',
  mealType: 'breakfast',
  dishId: target.id,
})
```

- [ ] **Step 2: 运行 store 测试确认失败**

Run: `pnpm test -- src/stores/menu.test.ts`

Expected: FAIL，提示 `shuffleTarget` 不存在或仍得到旧的布尔状态。

- [ ] **Step 3: 实现 `ShuffleTarget` 和串行随机入口**

在 `src/stores/menu.ts` 定义并使用以下状态与方法；`isShuffling` 不再可写，而是只读派生值：

```ts
export type ShuffleTarget =
  | { scope: 'all' }
  | { scope: 'meal'; mealType: MealType }
  | { scope: 'dish'; mealType: MealType; dishId: string }
  | null

const shuffleTarget = ref<ShuffleTarget>(null)
const isShuffling = computed(() => shuffleTarget.value !== null)

// 所有随机入口共享同一把锁，并保证成功或失败后都恢复交互状态。
const shuffle = (target: Exclude<ShuffleTarget, null>, createMenu: () => DailyMenu) => {
  refreshDate()
  if (shuffleTarget.value) return false

  shuffleTarget.value = target
  window.setTimeout(() => {
    try {
      persist(createMenu())
    } catch {
      notify('当前偏好下没有足够候选，请恢复一些不喜欢的菜')
    } finally {
      shuffleTarget.value = null
    }
  }, 420)
  return true
}

const generateAll = () =>
  shuffle({ scope: 'all' }, () =>
    generateDailyMenu(today.value, preferences.rules),
  )

const rerollMeal = (type: MealType) =>
  shuffle({ scope: 'meal', mealType: type }, () => {
    const currentMenu = menu.value!
    const otherIds = new Set(
      (['breakfast', 'lunch', 'dinner'] as MealType[])
        .filter((mealType) => mealType !== type)
        .flatMap((mealType) => currentMenu[mealType].dishes.map((dish) => dish.id)),
    )
    const nextMeal =
      type === 'breakfast'
        ? generateBreakfast(otherIds, preferences.rules)
        : type === 'lunch'
          ? generateLunch({ excludedIds: otherIds, preferences: preferences.rules })
          : generateDinner(otherIds, preferences.rules)

    return { ...currentMenu, [type]: nextMeal }
  })

const rerollDish = (type: MealType, dishId: string) =>
  shuffle({ scope: 'dish', mealType: type, dishId }, () => ({
    ...menu.value!,
    [type]: replaceDish(menu.value![type], dishId, preferences.rules),
  }))
```

在 `dislikeDish` 中继续先验证替换是否可行，成功记录偏好后调用：

```ts
return shuffle(
  { scope: 'dish', mealType: type, dishId },
  () => ({ ...menu.value!, [type]: nextMeal }),
)
```

所有并发判断统一改为 `if (shuffleTarget.value) return false`，并在 store 返回值中同时暴露 `shuffleTarget` 和 `isShuffling`。

- [ ] **Step 4: 运行 store 测试确认通过**

Run: `pnpm test -- src/stores/menu.test.ts`

Expected: PASS，整桌、单餐、单菜目标均在 420ms 后清空，失败路径也恢复为 `null`。

- [ ] **Step 5: 提交随机状态改动**

```bash
git add src/stores/menu.ts src/stores/menu.test.ts
git commit -m "refactor: scope menu shuffle loading"
```

### Task 2: 恢复紧凑首屏并删除 Time 与三餐进度

**Files:**
- Modify: `src/components/HomeHeader.vue`
- Modify: `src/components/HomeHeader.test.ts`
- Delete: `src/components/MealProgress.vue`
- Delete: `src/components/MealProgress.test.ts`
- Delete: `src/domain/mealTimeline.ts`
- Delete: `src/domain/mealTimeline.test.ts`

- [ ] **Step 1: 把首页头部测试改成已确认的首屏结构**

用以下断言替换 `src/components/HomeHeader.test.ts` 的旧用例：

```ts
it('展示本地日期、Typewriter、原版标题和一键开饭入口', () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as typeof window.matchMedia
  const wrapper = mount(HomeHeader, {
    props: { disabled: false, now: new Date(2026, 6, 14, 18, 0) },
  })

  expect(wrapper.text()).toContain('7月14日')
  expect(wrapper.text()).toContain('星期二')
  expect(wrapper.text()).toContain('傍晚好，今天也轻松吃饭')
  expect(wrapper.text()).toContain('今天吃点啥？')
  expect(wrapper.text()).toContain('不用再发愁')
  expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(true)
  expect(wrapper.find('[data-animal-component="time"]').exists()).toBe(false)
  expect(wrapper.find('[data-meal-step]').exists()).toBe(false)
  expect(wrapper.find('img').exists()).toBe(false)
})

it('减少动态效果时直接展示问候并触发生成事件', async () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as typeof window.matchMedia
  const wrapper = mount(HomeHeader, {
    props: { disabled: false, now: new Date(2026, 6, 14, 8, 0) },
  })

  expect(wrapper.find('[data-animal-component="typewriter"]').exists()).toBe(false)
  expect(wrapper.text()).toContain('早上好，今天也元气开饭')
  await wrapper.get('[data-testid="generate-menu"]').trigger('click')
  expect(wrapper.emitted('generate')).toHaveLength(1)
})
```

- [ ] **Step 2: 运行头部测试确认失败**

Run: `pnpm test -- src/components/HomeHeader.test.ts`

Expected: FAIL，旧实现仍包含 `Time`、三餐进度和“重新安排今日菜单”。

- [ ] **Step 3: 用 Tailwind 重写紧凑首屏**

`src/components/HomeHeader.vue` 只导入 `Button`、`Typewriter`，保留现有每分钟更新时间与时段问候逻辑。模板替换为以下结构，不添加插画或远程头像：

```vue
<template>
  <header class="px-4 pt-7 pb-5 sm:px-5">
    <p class="m-0 flex items-center gap-2 text-xs font-bold tracking-[.12em] text-forest-dark">
      <span class="h-2 w-2 rounded-full bg-clay" aria-hidden="true" />
      {{ formatDate(currentNow) }} · 全家今日菜单
    </p>

    <div class="mt-4 text-sm font-semibold tracking-wide text-forest-dark">
      <Typewriter v-if="!reduceMotion" :text="greeting" :speed="45" />
      <span v-else>{{ greeting }}</span>
    </div>

    <h1 class="mt-2 mb-0 font-display text-[2.65rem] leading-[.98] font-black text-ink">
      今天<span class="relative ml-1 inline-block text-clay">吃点啥？</span>
    </h1>
    <p class="mt-3 mb-0 max-w-[30rem] text-sm leading-6 text-muted">
      不用再发愁，让小餐桌帮一家三口安排得明明白白。
    </p>

    <Button
      data-testid="generate-menu"
      class="mt-5 min-h-14 w-full rounded-2xl! bg-forest! text-base! font-bold! shadow-paper"
      type="primary"
      size="large"
      block
      :disabled="disabled"
      @click="emit('generate')"
    >
      <span class="flex items-center justify-center gap-2">
        <svg class="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 3v8M5 3v5c0 2 1.3 3 3 3s3-1 3-3V3M8 11v10M16 3v18M16 3c3 2 4 5 4 8h-4" />
        </svg>
        一键开饭
      </span>
    </Button>
    <p class="mt-2 mb-0 text-center text-xs text-muted">每一餐都能单独换，直到全家都点头</p>
  </header>
</template>
```

props 改为 `defineProps<{ disabled: boolean; now?: Date }>()`，脚本中不再引用 `Time`、`Title` 或 `MealProgress`。

- [ ] **Step 4: 删除进度组件和领域逻辑并验证**

```bash
git rm src/components/MealProgress.vue src/components/MealProgress.test.ts
git rm src/domain/mealTimeline.ts src/domain/mealTimeline.test.ts
pnpm test -- src/components/HomeHeader.test.ts
rg -n "Time|MealProgress|mealTimeline|data-meal-step|1f46a" src/components src/views src/domain
```

Expected: 测试 PASS；`rg` 无输出。菜品数据中的其他 Twemoji URL不在本次删除范围，禁止出现的家庭头像编码 `1f46a` 不存在。

- [ ] **Step 5: 提交首屏修正**

```bash
git add src/components/HomeHeader.vue src/components/HomeHeader.test.ts
git commit -m "refactor: restore compact home header"
```

### Task 3: 恢复三餐纸张布局、角色颜色与 A 操作区

**Files:**
- Create: `src/ui/dishRoleMeta.ts`
- Modify: `src/styles/theme.css`
- Modify: `src/views/HomeView.vue`
- Modify: `src/components/MealCard.vue`
- Modify: `src/components/DishCard.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1: 为三餐颜色、角色样式和局部 loading 写失败测试**

在 `src/components/components.test.ts` 增加以下覆盖：

```ts
it.each([
  ['tomato-eggs', 'baby', 'border-baby', 'bg-baby-soft', 'bg-baby'],
  ['pepper-pork', 'spicy', 'border-spicy', 'bg-spicy-soft', 'bg-spicy'],
  ['steamed-seabass', 'shared', 'border-shared', 'bg-shared-soft', 'bg-shared'],
] as const)('菜品卡恢复 %s 的角色颜色', (dishId, role, borderClass, imageClass, badgeClass) => {
  const dish = dishes.find((item) => item.id === dishId)!
  const wrapper = mount(DishCard, { props: { dish } })

  expect(wrapper.get('article').attributes('data-role')).toBe(role)
  expect(wrapper.get('article').classes()).toContain(borderClass)
  expect(wrapper.get('[data-testid="dish-image-wrap"]').classes()).toContain(imageClass)
  expect(wrapper.get('[data-testid="role-label"]').classes()).toContain(badgeClass)
  expect(wrapper.get('[data-testid="role-label"]').text()).toBeTruthy()
})

it('喜欢与不喜欢使用不同心形图标并固定在操作区', () => {
  const dish = dishes.find((item) => item.id === 'pepper-pork')!
  const wrapper = mount(DishCard, { props: { dish, liked: true, loading: true } })

  expect(wrapper.get('[data-testid="like-dish"] [data-icon="heart"]').exists()).toBe(true)
  expect(wrapper.get('[data-testid="dislike-dish"] [data-icon="heart-off"]').exists()).toBe(true)
  expect(wrapper.get('[data-testid="like-dish"]').attributes('aria-pressed')).toBe('true')
  expect(wrapper.get('[data-testid="replace-dish"]').attributes('aria-busy')).toBe('true')
})

it.each([
  ['breakfast', 'app-yellow'],
  ['lunch', 'app-green'],
  ['dinner', 'app-orange'],
] as const)('%s 使用 middle Title 和对应餐次颜色', (type, color) => {
  const wrapper = mount(MealCard, {
    props: {
      meal: { type, dishes: [dishes.find((item) => item.id === 'steamed-rice')!] },
    },
  })
  const title = wrapper.get('[data-animal-component="title"]')

  expect(title.attributes('size')).toBe('middle')
  expect(title.attributes('color')).toBe(color)
  expect(wrapper.find('[data-animal-component="divider"]').exists()).toBe(true)
})
```

把原“餐次卡”用例的 props 扩展为 `loading: true, shufflingDishId: 'steamed-rice'`，并断言换一餐和目标换一道按钮均有 `aria-busy="true"`。

- [ ] **Step 2: 运行组件测试确认失败**

Run: `pnpm test -- src/components/components.test.ts`

Expected: FAIL，旧菜品卡没有角色边框、心形斜线图标和范围 loading props。

- [ ] **Step 3: 建立角色颜色的单一静态映射**

在 `src/styles/theme.css` 的 `@theme` 中增加：

```css
--color-baby: #d7ad38;
--color-baby-soft: #fff1b8;
--color-spicy: #c85b4a;
--color-spicy-soft: #f8d0c8;
--color-shared: #6f9b68;
--color-shared-soft: #dcebd4;
```

新建 `src/ui/dishRoleMeta.ts`，所有类名必须完整写在对象中：

```ts
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
    badgeClass: 'bg-baby text-white',
    legendClass: 'bg-baby',
  },
  spicy: {
    label: '妈妈辣菜',
    cardClass: 'border-spicy bg-spicy-soft/30',
    imageClass: 'bg-spicy-soft',
    badgeClass: 'bg-spicy text-white',
    legendClass: 'bg-spicy',
  },
  shared: {
    label: '全家共享',
    cardClass: 'border-shared bg-shared-soft/35',
    imageClass: 'bg-shared-soft',
    badgeClass: 'bg-shared text-white',
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
```

- [ ] **Step 4: 用原生业务容器重写菜品卡 A 布局**

`src/components/DishCard.vue` 增加 `loading?: boolean` prop，导入 `dishRoleMeta`，并用 `const roleMeta = computed(() => dishRoleMeta[props.dish.role])` 取样式。保留图片 watch 与本地占位图回退，模板采用：

```vue
<article
  :data-role="dish.role"
  :class="['relative flex min-h-32 gap-3 rounded-[22px] border-2 p-3 shadow-sm', roleMeta.cardClass]"
>
  <div data-testid="dish-image-wrap" :class="['relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl max-[380px]:h-20 max-[380px]:w-20', roleMeta.imageClass]">
    <img class="h-full w-full object-cover" :src="imageSrc" :alt="dish.name" @error="onImageError" />
    <span data-testid="role-label" :class="['absolute right-1 bottom-1 rounded-full px-2 py-1 text-[10px] font-bold', roleMeta.badgeClass]">
      {{ roleMeta.label }}
    </span>
  </div>

  <div class="relative min-w-0 flex-1 pb-12">
    <h3 class="m-0 truncate pr-[94px] font-display text-lg font-bold text-ink">{{ dish.name }}</h3>
    <p class="mt-2 mb-0 line-clamp-2 text-xs leading-5 text-muted">{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>

    <div class="absolute top-0 right-0 flex gap-1.5">
      <button
        data-testid="like-dish"
        :class="['grid h-11 w-11 place-items-center rounded-xl border transition-colors', liked ? 'border-[#d65d72] bg-[#e8788b] text-white' : 'border-[#e6a3af] bg-[#fff0f2] text-[#bf6171]']"
        type="button"
        :disabled="disabled"
        :aria-label="liked ? `取消喜欢${dish.name}` : `喜欢${dish.name}`"
        :aria-pressed="liked"
        @click="emit('like', dish.id)"
      >
        <svg data-icon="heart" class="h-5 w-5 stroke-current stroke-2" :class="liked ? 'fill-current' : 'fill-none'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
        </svg>
      </button>
      <button
        data-testid="dislike-dish"
        class="grid h-11 w-11 place-items-center rounded-xl border border-line bg-paper-soft text-muted"
        type="button"
        :disabled="disabled"
        :aria-label="`不喜欢${dish.name}`"
        @click="emit('dislike', dish.id)"
      >
        <svg data-icon="heart-off" class="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
          <path d="M4 4l16 16" />
        </svg>
      </button>
    </div>

    <Button
      data-testid="replace-dish"
      class="absolute right-0 bottom-0 min-h-11 rounded-xl! border-line! bg-paper! px-3! text-xs! text-ink!"
      type="default"
      size="small"
      :loading="loading"
      :disabled="disabled"
      :aria-busy="loading"
      :aria-label="`换掉${dish.name}`"
      @click="emit('replace', dish.id)"
    >
      <span class="flex items-center gap-1.5">↻ 换一道</span>
    </Button>
  </div>
</article>
```

原生偏好按钮始终保持 44px；`disabled` 时增加 `disabled:cursor-not-allowed disabled:opacity-55`，不改变事件名和 aria 文案。

- [ ] **Step 5: 重写餐次卡并向菜品传入目标 loading**

`src/components/MealCard.vue` 删除 `Card`，props 调整为：

```ts
const props = withDefaults(
  defineProps<{
    meal: Meal
    likedIds?: ReadonlySet<string>
    disabled?: boolean
    loading?: boolean
    shufflingDishId?: string | null
  }>(),
  {
    likedIds: () => new Set<string>(),
    disabled: false,
    loading: false,
    shufflingDishId: null,
  },
)
```

保留当前 `mealMeta` 的 `app-yellow`、`app-green`、`app-orange`，模板结构固定为：

```vue
<section class="rounded-[26px] border border-line/70 bg-paper/90 p-4 shadow-paper">
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="m-0 text-xs font-bold tracking-wide text-muted">{{ mealMeta[meal.type].kicker }} · {{ mealMeta[meal.type].time }}</p>
      <Title class="mt-1 block" size="middle" :color="mealMeta[meal.type].color">{{ mealMeta[meal.type].title }}</Title>
    </div>
    <Button
      data-testid="reroll-meal"
      class="min-h-11 shrink-0 rounded-xl! border-line! bg-paper-soft! text-ink!"
      type="default"
      size="small"
      :loading="loading"
      :disabled="disabled"
      :aria-busy="loading"
      @click="emit('reroll')"
    >↻ 换一餐</Button>
  </div>
  <Divider type="dashed-brown" />
  <div class="grid gap-3">
    <DishCard
      v-for="dish in meal.dishes"
      :key="dish.id"
      :dish="dish"
      :liked="likedIds.has(dish.id)"
      :disabled="disabled"
      :loading="shufflingDishId === dish.id"
      @replace="emit('replace', $event)"
      @like="emit('like', $event)"
      @dislike="emit('dislike', $event)"
    />
  </div>
</section>
```

- [ ] **Step 6: 恢复首页纸张面板和图例并接入精确目标**

`src/views/HomeView.vue` 删除 `Loading` import，改为导入 `Footer` 和 `dishRoleMeta`，并定义 `const legendRoles = ['baby', 'spicy', 'shared'] as const`。`HomeHeader` 使用 `:disabled="menuStore.isShuffling"`。首页主体结构使用：

```vue
<main v-if="menuStore.menu" class="w-full">
  <HomeHeader :disabled="menuStore.isShuffling" @generate="menuStore.generateAll" />

  <section class="relative mx-3 rounded-[30px] border border-line/70 bg-paper/[.92] px-3 py-5 shadow-paper sm:mx-4 sm:px-4" aria-labelledby="menu-board-title" aria-live="polite">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="m-0 text-xs font-bold tracking-[.12em] text-forest-dark">今日餐桌 · 已经安排好啦</p>
        <h2 id="menu-board-title" class="mt-1 mb-0 font-display text-2xl text-ink">一家人的三顿饭</h2>
      </div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-muted" aria-label="菜品标签说明">
        <span v-for="role in legendRoles" :key="role" class="flex items-center gap-1">
          <i :class="['h-2.5 w-2.5 rounded-full', dishRoleMeta[role].legendClass]" />
          {{ dishRoleMeta[role].label }}
        </span>
      </div>
    </div>

    <div class="grid gap-4">
      <MealCard
        :meal="menuStore.menu.breakfast"
        :liked-ids="preferences.rules.likedIds"
        :disabled="menuStore.isShuffling"
        :loading="menuStore.shuffleTarget?.scope === 'meal' && menuStore.shuffleTarget.mealType === 'breakfast'"
        :shuffling-dish-id="menuStore.shuffleTarget?.scope === 'dish' && menuStore.shuffleTarget.mealType === 'breakfast' ? menuStore.shuffleTarget.dishId : null"
        @reroll="menuStore.rerollMeal('breakfast')"
        @replace="menuStore.rerollDish('breakfast', $event)"
        @like="menuStore.toggleLike"
        @dislike="menuStore.dislikeDish('breakfast', $event)"
      />
      <MealCard
        :meal="menuStore.menu.lunch"
        :liked-ids="preferences.rules.likedIds"
        :disabled="menuStore.isShuffling"
        :loading="menuStore.shuffleTarget?.scope === 'meal' && menuStore.shuffleTarget.mealType === 'lunch'"
        :shuffling-dish-id="menuStore.shuffleTarget?.scope === 'dish' && menuStore.shuffleTarget.mealType === 'lunch' ? menuStore.shuffleTarget.dishId : null"
        @reroll="menuStore.rerollMeal('lunch')"
        @replace="menuStore.rerollDish('lunch', $event)"
        @like="menuStore.toggleLike"
        @dislike="menuStore.dislikeDish('lunch', $event)"
      />
      <MealCard
        :meal="menuStore.menu.dinner"
        :liked-ids="preferences.rules.likedIds"
        :disabled="menuStore.isShuffling"
        :loading="menuStore.shuffleTarget?.scope === 'meal' && menuStore.shuffleTarget.mealType === 'dinner'"
        :shuffling-dish-id="menuStore.shuffleTarget?.scope === 'dish' && menuStore.shuffleTarget.mealType === 'dinner' ? menuStore.shuffleTarget.dishId : null"
        @reroll="menuStore.rerollMeal('dinner')"
        @replace="menuStore.rerollDish('dinner', $event)"
        @like="menuStore.toggleLike"
        @dislike="menuStore.dislikeDish('dinner', $event)"
      />
    </div>
  </section>

  <ShoppingList :list="menuStore.shoppingList" />
  <div class="mx-4 mb-4 border-t border-line/70 px-1 pt-4 text-center text-xs leading-6 text-muted sm:mx-5">
    <p class="m-0 font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
    <span>菜单随机生成 · 少盐少辣照顾小朋友</span>
    <Footer type="tree" />
  </div>
</main>
```

新版 `ShoppingList.vue` 的 `Collapse` 结构不改。

- [ ] **Step 7: 运行组件与应用测试**

Run: `pnpm test -- src/components/components.test.ts src/components/HomeHeader.test.ts src/App.test.ts`

Expected: PASS，Title 颜色、角色边框、两种心形图标和按钮级 loading 均可观察。

- [ ] **Step 8: 提交首页和卡片修正**

```bash
git add src/ui/dishRoleMeta.ts src/styles/theme.css src/views/HomeView.vue src/components/MealCard.vue src/components/DishCard.vue src/components/components.test.ts
git commit -m "refactor: restore family meal card layout"
```

### Task 4: 恢复原版口味偏好页结构

**Files:**
- Modify: `src/views/PreferencesView.vue`
- Modify: `src/views/PreferencesView.test.ts`
- Modify: `src/components/PreferenceDishList.vue`
- Modify: `src/components/DataBackupPanel.vue`

- [ ] **Step 1: 把偏好页测试改回原版交互入口**

`src/views/PreferencesView.test.ts` 的首个用例改为断言原生标签页和 Footer：

```ts
expect(wrapper.text()).toContain('家庭口味簿')
expect(wrapper.text()).toContain('辣椒炒肉')
expect(wrapper.text()).toContain('共记录 2 道菜')
expect(wrapper.find('[data-animal-component="tabs"]').exists()).toBe(false)
expect(wrapper.find('[data-animal-footer="tree"]').exists()).toBe(true)

await wrapper.get('[data-testid="cancel-like"]').trigger('click')
expect(preferences.isLiked('pepper-pork')).toBe(false)

await wrapper.get('[data-testid="disliked-tab"]').trigger('click')
expect(wrapper.text()).toContain('西红柿炒鸡蛋')
```

备份两个用例删除打开 `backup-collapse` 的点击步骤，并增加：

```ts
expect(wrapper.find('[data-testid="backup-collapse"]').exists()).toBe(false)
```

- [ ] **Step 2: 运行偏好页测试确认失败**

Run: `pnpm test -- src/views/PreferencesView.test.ts`

Expected: FAIL，当前页面仍使用 `Tabs` 与备份 `Collapse`。

- [ ] **Step 3: 用 Tailwind 恢复偏好页原版层级**

`src/views/PreferencesView.vue` 只从组件库导入 `Footer`，恢复 `RouterLink` 和原生标签页；脚本删除 `preferenceTabs`。模板骨架如下：

```vue
<main v-if="menuStore.menu" class="px-4 pt-6 pb-5 sm:px-5">
  <header class="rounded-[28px] border border-line/70 bg-paper/90 p-5 shadow-paper">
    <RouterLink class="inline-flex min-h-11 items-center text-sm font-bold text-forest-dark" to="/">← 回到今日菜单</RouterLink>
    <p class="mt-4 mb-0 text-xs font-bold tracking-[.14em] text-forest-dark">一家人的私人口味</p>
    <h1 class="mt-1 mb-0 font-display text-[2.35rem] leading-none text-ink">家庭口味簿</h1>
    <p class="mt-3 mb-4 text-sm leading-6 text-muted">喜欢的菜会更常出现，不喜欢的菜就留在这里，想吃时再把它请回来。</p>
    <div class="grid grid-cols-3 gap-2">
      <span class="rounded-xl bg-paper-soft px-2 py-3 text-center text-xs text-muted"><b class="block font-display text-2xl text-clay">{{ preferences.likedIds.length }}</b>喜欢</span>
      <span class="rounded-xl bg-paper-soft px-2 py-3 text-center text-xs text-muted"><b class="block font-display text-2xl text-clay">{{ preferences.dislikedIds.length }}</b>不喜欢</span>
      <span class="flex items-center justify-center rounded-xl bg-paper-soft px-2 py-3 text-center text-xs leading-5 text-muted">共记录 {{ preferences.preferenceCount }} 道菜</span>
    </div>
  </header>

  <section class="mt-5 rounded-[28px] border border-line/70 bg-paper/90 p-4 shadow-paper" aria-labelledby="preferences-book-title">
    <p class="m-0 text-xs font-bold tracking-wide text-forest-dark">翻开今天的记录</p>
    <h2 id="preferences-book-title" class="mt-1 mb-0 font-display text-2xl text-ink">喜欢 / 不喜欢</h2>
    <div class="mt-4 grid grid-cols-2 gap-2" aria-label="口味偏好分类">
      <button data-testid="liked-tab" type="button" :aria-pressed="activeTab === 'liked'" :class="tabClass(activeTab === 'liked')" @click="activeTab = 'liked'">喜欢的菜 <span>{{ preferences.likedIds.length }}</span></button>
      <button data-testid="disliked-tab" type="button" :aria-pressed="activeTab === 'disliked'" :class="tabClass(activeTab === 'disliked')" @click="activeTab = 'disliked'">不喜欢的菜 <span>{{ preferences.dislikedIds.length }}</span></button>
    </div>
    <PreferenceDishList :dishes="visibleDishes" :mode="activeTab" @action="activeTab === 'liked' ? cancelLike($event) : restoreDish($event)" />
  </section>

  <DataBackupPanel :menu="menuStore.menu" :preferences="{ likedIds: preferences.likedIds, dislikedIds: preferences.dislikedIds }" @before-export="menuStore.refreshDate()" @restore="restoreBackup" />
  <p class="mt-7 border-t border-line/70 pt-4 text-center font-display text-sm text-ink">今天也要和喜欢的人，好好吃饭。</p>
  <Footer type="tree" />
</main>
```

脚本增加完整静态类选择器，避免运行时拼接 Tailwind 类：

```ts
const tabClass = (active: boolean) => [
  'min-h-11 rounded-xl border px-3 text-sm font-bold transition-colors',
  active
    ? 'border-forest bg-forest text-white'
    : 'border-line bg-paper-soft text-muted',
]
```

- [ ] **Step 4: 恢复偏好列表为原生卡片并保留 Button**

`src/components/PreferenceDishList.vue` 删除 `Card`，保留 `Button`。有数据时每项使用：

```vue
<article v-for="dish in dishes" :key="dish.id" class="flex items-center gap-3 rounded-2xl border border-line/70 bg-paper-soft/65 p-3">
  <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand/45">
    <img class="h-full w-full object-cover" :src="dish.image" :alt="dish.name" />
  </div>
  <div class="min-w-0 flex-1">
    <span class="text-[11px] font-bold text-forest-dark">{{ preferenceOwner(dish) }}</span>
    <h3 class="mt-0.5 mb-0 truncate font-display text-lg text-ink">{{ dish.name }}</h3>
    <p class="mt-1 mb-0 truncate text-xs text-muted">{{ dish.ingredients.map((item) => item.name).join(' · ') }}</p>
  </div>
  <Button
    :data-testid="mode === 'liked' ? 'cancel-like' : 'restore-dish'"
    class="min-h-11 shrink-0 rounded-xl! border-line! bg-paper! px-2! text-xs! text-ink!"
    type="default"
    size="small"
    @click="emit('action', dish.id)"
  >{{ mode === 'liked' ? '取消喜欢' : '重新加入' }}</Button>
</article>
```

空状态沿用现有文案，外层改为 `mt-4 rounded-2xl border border-dashed border-line bg-paper-soft/55 px-5 py-8 text-center`。

- [ ] **Step 5: 移除备份 Collapse，完整保留导入导出逻辑**

`src/components/DataBackupPanel.vue` 只从组件库导入 `Button`，script 中 `exportBackup`、`chooseBackup`、`onFileChange`、`confirmImport` 和所有错误文案不改。模板恢复为始终展开的原版顺序：标题和设备提示、说明、两个 Button、隐藏文件 input、错误提示、待恢复预览；外层使用：

```vue
<section class="mt-5 rounded-[28px] border border-line/70 bg-paper/90 p-4 shadow-paper" aria-labelledby="backup-panel-title">
  <div class="flex items-end justify-between gap-3">
    <div>
      <p class="m-0 text-xs font-bold tracking-wide text-forest-dark">留一份安心</p>
      <h2 id="backup-panel-title" class="mt-1 mb-0 font-display text-2xl text-ink">数据备份</h2>
    </div>
    <span class="text-xs text-muted">只保存在你的设备里</span>
  </div>
  <p class="mt-3 mb-0 text-sm leading-6 text-muted">导出菜单和口味记录，换手机或清理浏览器后还能再恢复。</p>
  <div class="mt-4 grid grid-cols-2 gap-2">
    <Button type="primary" class="min-h-11 rounded-xl! bg-forest! text-sm! font-bold!" @click="exportBackup">导出备份</Button>
    <Button type="default" class="min-h-11 rounded-xl! border-line! bg-paper-soft! text-sm! text-ink!" @click="chooseBackup">导入恢复</Button>
    <input ref="fileInput" data-testid="backup-file" class="sr-only" type="file" accept="application/json,.json" @change="onFileChange" />
  </div>

  <p v-if="importError" class="mt-3 mb-0 rounded-xl bg-clay/[.12] px-3 py-2 text-sm font-semibold text-clay" role="alert">{{ importError }}</p>

  <div v-if="pendingBackup" class="mt-3 rounded-2xl border border-line/70 bg-sand/25 p-3" role="status">
    <span class="text-xs font-bold text-forest-dark">确认恢复</span>
    <h3 class="mt-1 mb-0 font-display text-lg text-ink">{{ previewDate }} 的备份</h3>
    <p class="mt-2 mb-0 text-sm leading-6 text-muted">
      菜单日期 {{ pendingBackup.menu.date }} ·
      喜欢 {{ pendingBackup.preferences.likedIds.length }} 道 ·
      不喜欢 {{ pendingBackup.preferences.dislikedIds.length }} 道
    </p>
    <div class="mt-3 flex gap-2">
      <Button data-testid="confirm-import" type="primary" class="min-h-11 flex-1 rounded-xl! bg-forest!" @click="confirmImport">覆盖并恢复</Button>
      <Button type="default" class="min-h-11 flex-1 rounded-xl! border-line! bg-paper! text-ink!" @click="pendingBackup = null">暂不恢复</Button>
    </div>
  </div>
</section>
```

确认和取消继续使用 `Button`，并保留 `data-testid="confirm-import"`。

- [ ] **Step 6: 运行偏好与备份回归测试**

Run: `pnpm test -- src/views/PreferencesView.test.ts src/services/appBackup.test.ts src/services/dishPreferenceStorage.test.ts`

Expected: PASS，原生标签页可切换，备份无需展开即可导入，非法文件仍显示原错误且不覆盖偏好。

- [ ] **Step 7: 提交偏好页修正**

```bash
git add src/views/PreferencesView.vue src/views/PreferencesView.test.ts src/components/PreferenceDishList.vue src/components/DataBackupPanel.vue
git commit -m "refactor: restore preference book layout"
```

### Task 5: 加入整页 Loading、清理组件残留并全量回归

**Files:**
- Modify: `src/App.vue`
- Modify: `src/App.test.ts`
- Modify: `src/styles/theme.css`
- Modify: `src/test/animalIslandStub.ts`
- Modify: `src/components/AppNavigation.vue`
- Modify: `src/components/AppNavigation.test.ts`
- Modify: `src/components/ShoppingList.vue`
- Modify: `src/components/components.test.ts`

- [ ] **Step 1: 为整桌遮罩和局部 loading 隔离写失败测试**

在 `src/App.test.ts` 新增：

```ts
it('整桌随机覆盖应用画布和底部导航', async () => {
  const { wrapper } = await mountApp()
  const menuStore = useMenuStore()

  await wrapper.get('[data-testid="generate-menu"]').trigger('click')

  expect(menuStore.shuffleTarget).toEqual({ scope: 'all' })
  expect(wrapper.get('[data-testid="full-page-loading"]').attributes('aria-modal')).toBe('true')
  expect(wrapper.text()).toContain('正在给餐桌换新菜')
  await vi.advanceTimersByTimeAsync(420)
  expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
})

it('单餐和单菜随机不显示整页遮罩', async () => {
  const { wrapper } = await mountApp()

  await wrapper.findAll('[data-testid="reroll-meal"]')[1].trigger('click')
  expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
  expect(wrapper.findAll('[data-testid="reroll-meal"]')[1].attributes('aria-busy')).toBe('true')
  await vi.advanceTimersByTimeAsync(420)

  await wrapper.findAll('[data-testid="replace-dish"]')[0].trigger('click')
  expect(wrapper.find('[data-testid="full-page-loading"]').exists()).toBe(false)
  expect(wrapper.findAll('[data-testid="replace-dish"]')[0].attributes('aria-busy')).toBe('true')
})
```

- [ ] **Step 2: 运行应用测试确认失败**

Run: `pnpm test -- src/App.test.ts`

Expected: FAIL，应用壳层还没有 `full-page-loading`。

- [ ] **Step 3: 在应用壳层实现页面专用 Loading**

在 `src/App.vue` 的 `AppNavigation` 之后加入固定遮罩，使其与应用壳同宽但覆盖整个视口：

```vue
<Transition name="full-page-loading">
  <div
    v-if="menuStore.shuffleTarget?.scope === 'all'"
    data-testid="full-page-loading"
    class="fixed inset-y-0 left-1/2 z-50 grid w-full max-w-[560px] -translate-x-1/2 place-items-center bg-forest-dark/45 px-6 backdrop-blur-[2px]"
    role="dialog"
    aria-modal="true"
    aria-label="正在生成今日菜单"
  >
    <div class="rounded-[28px] border-2 border-paper/80 bg-paper px-7 py-6 text-center shadow-[0_18px_50px_rgb(49_83_62_/_30%)]">
      <span class="block text-5xl motion-safe:animate-bounce" aria-hidden="true">🏝️</span>
      <p class="mt-3 mb-0 font-display text-lg font-bold text-ink">正在给餐桌换新菜…</p>
      <span class="mt-1 block text-xs text-muted">马上就开饭</span>
    </div>
  </div>
</Transition>
```

遮罩 z-index 必须高于底部导航和 toast；不导入组件库 `Loading`。全局 `prefers-reduced-motion` 规则继续把动画降至近乎静止。

- [ ] **Step 4: 把底部导航恢复为原版业务图标与触控布局**

`src/components/AppNavigation.test.ts` 删除组件库 Icon 断言，改为：

```ts
expect(wrapper.find('[data-icon="home"]').exists()).toBe(true)
expect(wrapper.find('[data-icon="heart"]').exists()).toBe(true)
expect(wrapper.find('[data-animal-icon]').exists()).toBe(false)
```

`src/components/AppNavigation.vue` 删除 `Icon` import，保留现有 props 和路由行为，模板使用：

```vue
<nav class="app-navigation fixed right-0 bottom-0 left-1/2 z-[45] grid w-full max-w-[560px] -translate-x-1/2 grid-cols-2 border-t-[3px] border-ink bg-paper/95 px-3 pt-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgb(71_51_35_/_16%)] backdrop-blur" aria-label="主要导航">
  <RouterLink to="/" class="flex min-h-13 flex-col items-center justify-center gap-1 rounded-[18px_15px_19px_14px] text-[11px] font-black text-muted no-underline transition-colors [&.router-link-exact-active]:bg-forest-dark [&.router-link-exact-active]:text-white">
    <svg data-icon="home" class="h-[23px] w-[23px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9M9.5 19v-5h5v5" />
    </svg>
    <span>今日菜单</span>
  </RouterLink>
  <RouterLink to="/preferences" class="flex min-h-13 flex-col items-center justify-center gap-1 rounded-[18px_15px_19px_14px] text-[11px] font-black text-muted no-underline transition-colors [&.router-link-exact-active]:bg-forest-dark [&.router-link-exact-active]:text-white">
    <span class="relative grid place-items-center leading-none">
      <svg data-icon="heart" class="h-[23px] w-[23px] fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.5S4 16 4 9.5A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 2.8c0 6.5-8 11-8 11Z" />
      </svg>
      <b v-if="preferenceCount" class="absolute -top-2 -right-3 grid min-w-[19px] place-items-center rounded-full border-2 border-paper bg-clay px-1 py-0.5 text-[8px] leading-none text-white">{{ preferenceCount }}</b>
    </span>
    <span>口味偏好</span>
  </RouterLink>
</nav>
```

两个入口继续保持至少 52px 高，整条导航继续限制在 560px 应用画布内。

- [ ] **Step 5: 保留采购清单 Collapse 并移除多余 Title**

`src/components/ShoppingList.vue` 继续使用 `Collapse`、`Divider` 和 `Icon`，删除 `Title` import，并把普通章节标题替换为：

```vue
<h2 id="shopping-list-title" class="mt-1 mb-0 font-display text-2xl text-paper">今日采购清单</h2>
```

其余分类过滤、第一项 `:default-expanded="index === 0"`、数量 `{{ list[category].length }} 样` 和列表结构不改。把 `src/components/components.test.ts` 的采购清单用例补充为：

```ts
const triggers = wrapper.findAll('[data-collapse-trigger]')
expect(triggers).toHaveLength(3)
expect(triggers[0].attributes('aria-expanded')).toBe('true')
expect(triggers[0].text()).toContain('2 样')
expect(wrapper.find('[data-animal-component="title"]').exists()).toBe(false)
```

- [ ] **Step 6: 清理已不使用的组件适配与测试桩**

从 `src/styles/theme.css` 删除 `.animal-time`、`.animal-time__date` 规则，只保留仍使用的 `Footer` 适配和基础主题。确认 `src/test/animalIslandStub.ts` 中不再被源码使用的 `Time`、`Loading`、`Tabs`、`Card` 导出可删除，保留 `Button`、`Typewriter`、`Title`、`Divider`、`Icon`、`Footer`、`Collapse`。

运行静态搜索：

```bash
rg -n "from 'animal-island-vue'" src --glob '*.vue'
rg -n "\b(Time|Loading|Tabs|Card)\b|MealProgress|mealTimeline|1f46a|data-meal-step" src
```

Expected: 第一条只出现已确认保留的组件；第二条无输出。`src/data/dishes.ts` 中其他菜品 Twemoji URL继续保留。

- [ ] **Step 7: 验证采购清单仍是保留的新结构**

Run: `pnpm test -- src/components/components.test.ts -t "采购清单只渲染有内容的分类"`

Expected: PASS，三个有内容分类渲染三个 Collapse，第一项默认展开，`Icon` 与数量仍存在。

- [ ] **Step 8: 运行全量测试与类型检查**

```bash
pnpm test
pnpm typecheck
```

Expected: 全部测试 PASS，`vue-tsc --noEmit` 退出码为 0。按照项目约束不执行 `pnpm build`，不主动打开浏览器。

- [ ] **Step 9: 检查最终改动范围和移动端静态约束**

```bash
git status --short
git diff --check
rg -n "max-w-\[560px\]|min-w-\[320px\]|h-11 w-11|border-baby|border-spicy|border-shared" src
```

Expected: 只有计划内文件有改动，`git diff --check` 无输出；560px 应用画布、320px 最小页面宽度、44px 偏好按钮和三类角色颜色均能在源码中定位。

- [ ] **Step 10: 提交整页 Loading 和清理**

```bash
git add src/App.vue src/App.test.ts src/styles/theme.css src/test/animalIslandStub.ts src/components/AppNavigation.vue src/components/AppNavigation.test.ts src/components/ShoppingList.vue src/components/components.test.ts
git commit -m "refactor: finish original layout correction"
```

## 最终验收清单

- 首页顺序为日期与问候、原版标题说明、一键开饭、今日餐桌、三餐、采购清单、页尾和底部导航。
- 首屏没有大型插画、`Time`、三餐进度或家庭头像 `1f46a`，Typewriter 与减少动态效果降级均保留。
- 早餐、午餐、晚餐仅各使用一个 `middle` Title，颜色分别为黄、绿、橙，并保留 Divider。
- 宝宝黄、妈妈红、全家绿来自同一静态映射，同时用于图例、卡片边框、图片区和标签。
- 喜欢与不喜欢是右上角两个独立 44px 原生图标按钮；换一道是右下角图标文字 Button。
- 整桌随机覆盖 560px 应用画布与底部导航，单餐和单菜只让目标 Button loading，所有随机仍串行且延迟 420ms。
- 今日采购清单继续使用新版 Collapse；偏好页恢复原版结构但保留 Footer、Button、备份逻辑和全部错误处理。
- 320px 起不产生横向滚动；全量测试和类型检查通过；未执行 build 或浏览器验证。
