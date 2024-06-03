import { createRouter, createMemoryHistory } from 'vue-router'
import home  from '../views/HomeView.vue'
import about from '../views/AboutView.vue'

const router = createRouter({
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },
    {
      path: '/about',
      name: 'about',
      component: about
    }
  ]
})

export default router
