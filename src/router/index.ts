import {
  createRouter,
  createWebHashHistory,
  type RouterHistory,
} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PreferencesView from '../views/PreferencesView.vue'

export function createAppRouter(
  history: RouterHistory = createWebHashHistory(import.meta.env.BASE_URL),
) {
  return createRouter({
    history,
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/preferences', name: 'preferences', component: PreferencesView },
      { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
    ],
    scrollBehavior: () => ({ top: 0 }),
  })
}
