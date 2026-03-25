import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Play from '../views/Play.vue'
import Info from '../views/Info.vue'
import Work from '../views/Work.vue'
import WorkDetail from '../views/WorkDetail.vue'
import Service from '../views/Service.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/info',
    name: 'Info',
    component: Info
  },
  {
    path: '/work',
    name: 'Work',
    component: Work
  },
  {
    path: '/work/:id',
    name: 'WorkDetail',
    component: WorkDetail
  },
  {
    path: '/play',
    name: 'Play',
    component: Play
  },
  {
    path: '/service',
    name: 'Service',
    component: Service
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
