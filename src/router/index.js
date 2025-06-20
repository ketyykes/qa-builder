import { createRouter, createWebHashHistory } from 'vue-router'

import HomeView from '../views/HomeView/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/simulator',
      name: 'simulator',
      component: () => import('../views/SimulatorView/SimulatorView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView/AboutView.vue'),
    },
  ],
})

export default router
