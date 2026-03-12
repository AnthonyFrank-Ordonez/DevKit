import { createRouter, createWebHistory } from 'vue-router'
import FormatterView from '@/views/FormatterView.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'formatter',
        component: FormatterView,
      },
      {
        path: 'regex-builder',
        name: 'regex-builder',
        component: () => import('../views/RegexBuilderView.vue'),
      },
      {
        path: 'color-picker',
        name: 'color-picker',
        component: () => import('../views/ColorPickerView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
