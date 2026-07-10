import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createAppRouter } from './router'
import 'animal-island-vue/style'
import './styles/theme.css'

createApp(App).use(createPinia()).use(createAppRouter()).mount('#app')
