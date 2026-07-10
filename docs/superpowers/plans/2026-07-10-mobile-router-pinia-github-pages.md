# 移动端 Router、Pinia 与 GitHub Pages 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将家庭菜单升级为移动端双路由应用，用 Pinia 管理菜单与偏好，支持本地 JSON 备份，并自动部署到 `mu-shan/three-meals-a-day` 的 GitHub Pages。

**Architecture:** `App.vue` 只保留移动端外壳、路由出口、底部导航和全局提示；`preferences`、`menu` 两个 Pinia store 管理跨路由状态并复用现有领域函数。备份解析保持为纯函数，GitHub Actions 在测试和构建成功后发布静态产物。

**Tech Stack:** Vue 3、Pinia、Vue Router 4、TypeScript、Vite、Vitest、Vue Test Utils、GitHub Actions、GitHub Pages

---

### Task 1：安装依赖并建立 Router 应用骨架

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `src/main.ts`
- Create: `src/router/index.ts`
- Create: `src/router/index.test.ts`
- Create: `src/views/HomeView.vue`
- Create: `src/views/PreferencesView.vue`

- [ ] **Step 1：安装 Pinia 与 Vue Router**

Run: `pnpm add pinia vue-router`

Expected: `package.json` 增加两个运行依赖，根目录锁文件同步更新。

- [ ] **Step 2：写 Router 失败测试**

使用 `createMemoryHistory()` 创建测试 Router，验证 `/`、`/preferences` 与未知路径重定向：

```ts
const router = createAppRouter(createMemoryHistory())
await router.push('/preferences')
await router.isReady()
expect(router.currentRoute.value.name).toBe('preferences')

await router.push('/missing')
expect(router.currentRoute.value.name).toBe('home')
```

- [ ] **Step 3：运行测试确认失败**

Run: `pnpm test src/router/index.test.ts`

Expected: FAIL，提示 Router 工厂或页面模块不存在。

- [ ] **Step 4：实现 Router 与应用注册**

`createAppRouter(history = createWebHashHistory(import.meta.env.BASE_URL))` 定义首页、偏好页和 catch-all 重定向，并配置 `scrollBehavior: () => ({ top: 0 })`。`main.ts` 创建 Pinia，按 `app.use(pinia).use(router)` 注册后挂载。

- [ ] **Step 5：运行 Router 测试与类型检查**

Run: `pnpm test src/router/index.test.ts && pnpm typecheck`

Expected: PASS。

- [ ] **Step 6：提交骨架**

```bash
git add package.json pnpm-lock.yaml src/main.ts src/router src/views
git commit -m "feat: add router and pinia foundation"
```

### Task 2：迁移口味偏好到 Pinia

**Files:**
- Create: `src/stores/preferences.ts`
- Create: `src/stores/preferences.test.ts`

- [ ] **Step 1：写 preferences store 失败测试**

使用 `setActivePinia(createPinia())` 和 jsdom `localStorage` 验证初始化、喜欢切换、不喜欢覆盖喜欢、恢复、规则集合和导入替换：

```ts
const store = usePreferencesStore()
store.initialize()
store.toggleLike('tomato-eggs')
expect(store.rules.likedIds.has('tomato-eggs')).toBe(true)

store.dislike('tomato-eggs')
expect(store.isLiked('tomato-eggs')).toBe(false)
expect(store.isDisliked('tomato-eggs')).toBe(true)

store.replacePreferences({ likedIds: ['pepper-pork'], dislikedIds: [] })
expect(store.likedIds).toEqual(['pepper-pork'])
```

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/stores/preferences.test.ts`

Expected: FAIL，提示 store 不存在。

- [ ] **Step 3：实现 preferences store**

使用 setup store 暴露 `likedIds`、`dislikedIds`、`rules`、`likedDishes`、`dislikedDishes`、`preferenceCount`、`initialize`、`toggleLike`、`dislike`、`restore`、`replacePreferences`。所有写操作继续调用 `saveDishPreferences`，并复用现有有效菜品 ID 清洗逻辑。

- [ ] **Step 4：运行偏好 store 与存储测试**

Run: `pnpm test src/stores/preferences.test.ts src/services/dishPreferenceStorage.test.ts`

Expected: PASS。

- [ ] **Step 5：提交偏好 store**

```bash
git add src/stores
git commit -m "refactor: move dish preferences into pinia"
```

### Task 3：迁移菜单状态到 Pinia

**Files:**
- Create: `src/stores/menu.ts`
- Create: `src/stores/menu.test.ts`

- [ ] **Step 1：写 menu store 失败测试**

覆盖初始化恢复、采购清单、全部重抽、单餐重抽、单道换菜、不喜欢即时替换、动画期间拒绝重复操作和异常后恢复加载状态。使用 fake timers 验证 420ms 动画：

```ts
const store = useMenuStore()
store.initialize(new Date(2026, 6, 10))
const target = store.menu!.breakfast.dishes[0]

expect(store.dislikeDish('breakfast', target.id)).toBe(true)
await vi.runAllTimersAsync()
expect(store.menu!.breakfast.dishes.some((dish) => dish.id === target.id)).toBe(false)
expect(usePreferencesStore().isDisliked(target.id)).toBe(true)
```

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/stores/menu.test.ts`

Expected: FAIL，提示 store 不存在。

- [ ] **Step 3：实现 menu store**

store 保存 `menu`、`isShuffling`、`feedback`，派生 `shoppingList`。`initialize` 复用 `loadTodayMenu`、`reconcileDailyMenu` 和偏好 store；生成与替换动作完整迁移当前 `App.vue` 逻辑。增加 `notify`、`clearFeedback`、`replaceImportedMenu`，所有异步动作使用 `try/finally` 复位状态。

- [ ] **Step 4：运行 store 与领域测试**

Run: `pnpm test src/stores/menu.test.ts src/domain/menuGenerator.test.ts src/domain/shoppingList.test.ts`

Expected: PASS。

- [ ] **Step 5：提交菜单 store**

```bash
git add src/stores/menu.ts src/stores/menu.test.ts
git commit -m "refactor: move daily menu state into pinia"
```

### Task 4：实现本地备份格式与导入校验

**Files:**
- Modify: `src/types/menu.ts`
- Create: `src/services/appBackup.ts`
- Create: `src/services/appBackup.test.ts`

- [ ] **Step 1：写备份失败测试**

验证版本 `1`、ISO 导出时间、文件名、合法解析、非法 JSON、未知版本、无效菜品 ID、偏好冲突和跨日判断：

```ts
const backup = createAppBackup(menu, preferences, new Date('2026-07-10T08:00:00Z'))
expect(backup.version).toBe(1)
expect(createBackupFilename(menu.date)).toBe('three-meals-a-day-backup-2026-07-10.json')
expect(parseAppBackup(JSON.stringify(backup))).toEqual({ ok: true, backup })
expect(parseAppBackup('{bad json').ok).toBe(false)
```

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/services/appBackup.test.ts`

Expected: FAIL，提示备份模块不存在。

- [ ] **Step 3：实现纯备份模块**

定义 `AppBackupV1`、`BackupParseResult`，实现 `createAppBackup`、`serializeAppBackup`、`createBackupFilename`、`parseAppBackup`。菜单校验要求日期、三个餐次、餐次类型、菜品 ID、角色与数据源一致；偏好要求字符串数组、有效 ID、去重且互斥。

- [ ] **Step 4：运行备份测试**

Run: `pnpm test src/services/appBackup.test.ts`

Expected: PASS。

- [ ] **Step 5：提交备份核心**

```bash
git add src/types/menu.ts src/services/appBackup.ts src/services/appBackup.test.ts
git commit -m "feat: add local data backup format"
```

### Task 5：迁移首页并简化 App 外壳

**Files:**
- Modify: `src/App.vue`
- Modify: `src/App.test.ts`
- Modify: `src/views/HomeView.vue`
- Modify: `src/components/FamilyHero.vue`
- Modify: `src/components/components.test.ts`
- Delete: `src/composables/useDishPreferences.ts`
- Delete: `src/composables/useDishPreferences.test.ts`

- [ ] **Step 1：改写应用集成失败测试**

使用测试 Router 与 Pinia 挂载 App，验证首页显示菜单、点击喜欢持久化、点击偏好入口进入 `/preferences`，路由往返后菜单 ID 不变。

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/App.test.ts src/components/components.test.ts`

Expected: FAIL，页面仍依赖旧 App 内部状态或抽屉。

- [ ] **Step 3：实现 HomeView 与 App 外壳**

`HomeView` 初始化 menu store，并组合 `FamilyHero`、`MealCard`、`ShoppingList`。`App.vue` 只渲染 `RouterView`、底部导航和全局 toast。`FamilyHero` 的偏好事件由 HomeView 调用 `router.push('/preferences')`。

- [ ] **Step 4：运行集成测试**

Run: `pnpm test src/App.test.ts src/components/components.test.ts src/stores/menu.test.ts`

Expected: PASS。

- [ ] **Step 5：提交首页迁移**

```bash
git add src/App.vue src/App.test.ts src/views/HomeView.vue src/components src/composables
git commit -m "refactor: move daily menu into home route"
```

### Task 6：实现偏好页与备份恢复界面

**Files:**
- Modify: `src/views/PreferencesView.vue`
- Create: `src/views/PreferencesView.test.ts`
- Create: `src/components/PreferenceDishList.vue`
- Create: `src/components/DataBackupPanel.vue`
- Delete: `src/components/DishPreferenceDrawer.vue`

- [ ] **Step 1：写偏好页失败测试**

验证统计、标签切换、取消喜欢、重新加入、空状态、导入错误、导入预览和确认恢复。文件输入测试使用 `File`：

```ts
const file = new File([serializeAppBackup(backup)], 'backup.json', {
  type: 'application/json',
})
Object.defineProperty(input.element, 'files', { value: [file] })
await input.trigger('change')
expect(wrapper.text()).toContain('确认恢复')
```

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/views/PreferencesView.test.ts`

Expected: FAIL，偏好页和备份组件尚未实现。

- [ ] **Step 3：实现偏好列表与备份面板**

偏好页使用 preferences store 展示两类列表。备份面板创建 Blob 下载链接；导入先 `file.text()` 与 `parseAppBackup`，显示预览后再调用 `replacePreferences`，同日调用 `replaceImportedMenu`，跨日调用 menu store 重新生成当天菜单。

- [ ] **Step 4：删除抽屉并运行页面测试**

Run: `pnpm test src/views/PreferencesView.test.ts src/components/components.test.ts`

Expected: PASS，源码不再引用 `DishPreferenceDrawer`。

- [ ] **Step 5：提交偏好页**

```bash
git add src/views src/components
git commit -m "feat: add preferences and backup route"
```

### Task 7：实现移动端专属布局与底部导航

**Files:**
- Create: `src/components/AppNavigation.vue`
- Create: `src/components/AppNavigation.test.ts`
- Modify: `src/App.vue`
- Modify: `src/styles/theme.css`

- [ ] **Step 1：写导航失败测试**

使用 memory router 挂载导航，验证两个链接、当前页 `aria-current="page"` 和偏好数量。

- [ ] **Step 2：运行测试确认失败**

Run: `pnpm test src/components/AppNavigation.test.ts`

Expected: FAIL，导航组件不存在。

- [ ] **Step 3：实现导航与移动画布**

导航固定在最大宽度 `560px` 画布底部，支持 `env(safe-area-inset-bottom)`。主题样式移除三列桌面布局和抽屉样式，所有餐次保持单列；桌面仅显示居中的手机画布与外部纹理背景。触控按钮最小高度 `44px`。

- [ ] **Step 4：运行组件测试与 CSS 解析**

Run: `pnpm test src/components/AppNavigation.test.ts src/components/components.test.ts`

Run: `node --input-type=module -e "import fs from 'node:fs'; import { parse } from 'css-tree'; parse(fs.readFileSync('src/styles/theme.css', 'utf8'))"`

Expected: 两条命令均退出码 `0`。

- [ ] **Step 5：提交移动端界面**

```bash
git add src/App.vue src/components/AppNavigation.vue src/components/AppNavigation.test.ts src/styles/theme.css
git commit -m "feat: focus interface on mobile use"
```

### Task 8：配置 Vite 与 GitHub Pages 自动部署

**Files:**
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1：配置动态 base**

Vite 配置读取 `GITHUB_REPOSITORY`：线上取仓库名并生成 `/${repositoryName}/`，本地保持 `/`。Router 继续使用 `import.meta.env.BASE_URL`。

- [ ] **Step 2：实现 Pages 工作流**

工作流使用 `actions/checkout`、`pnpm/action-setup`、`actions/setup-node`、`actions/configure-pages`、`actions/upload-pages-artifact` 和 `actions/deploy-pages`。权限包含 `contents: read`、`pages: write`、`id-token: write`，触发条件为 `main` push 与 `workflow_dispatch`。

- [ ] **Step 3：更新 README**

记录移动端双路由、本地独立数据、备份恢复、线上地址、GitHub Pages 更新方式与本地验证命令。

- [ ] **Step 4：运行完整本地验证**

Run: `pnpm test && pnpm typecheck && GITHUB_REPOSITORY=mu-shan/three-meals-a-day pnpm build`

Expected: 所有测试通过、类型检查通过、`dist/index.html` 资源路径包含 `/three-meals-a-day/`。

- [ ] **Step 5：提交部署配置**

```bash
git add vite.config.ts .github/workflows/deploy.yml README.md
git commit -m "ci: deploy app to github pages"
```

### Task 9：完成审查、创建仓库并上线

**Files:**
- Modify: `docs/superpowers/plans/2026-07-10-mobile-router-pinia-github-pages.md`

- [ ] **Step 1：请求代码审查并修复重要问题**

审查 store 候选边界、导入覆盖安全性、路由状态、手机触控可访问性和 Pages 工作流。修复 Critical/Important 后重新验证。

- [ ] **Step 2：确认工作区与 GitHub 身份**

Run: `git status --short && gh auth status && gh api user --jq .login`

Expected: 工作区干净，登录账号为 `mu-shan`。

- [ ] **Step 3：创建公开仓库并推送**

若远端不存在：

```bash
gh repo create mu-shan/three-meals-a-day --public --source=. --remote=origin --push
```

若远端已存在但为空，则验证所有者后设置 `origin` 并推送 `main`，不覆盖未知远端提交。

- [ ] **Step 4：启用并等待 Pages 部署**

确认仓库 Pages 使用 GitHub Actions，查看 `deploy.yml` 对应运行并等待完成：

```bash
gh run list --repo mu-shan/three-meals-a-day --workflow deploy.yml --limit 1
gh run watch --repo mu-shan/three-meals-a-day <run-id> --exit-status
```

- [ ] **Step 5：确认线上地址**

读取 Pages API 与部署结果，确认 `https://mu-shan.github.io/three-meals-a-day/` 返回成功，首页和 `/#/preferences` 使用同一静态入口。
