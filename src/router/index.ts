import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import GoalPage from '../views/GoalPage.vue'
import SettingsPage from '../views/SettingsPage.vue'
import TasksPage from '../views/TasksPage.vue'
import TutorialPage from '../views/TutorialPage.vue'
import HomePage from '../views/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tutorial'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/goal/:goal_id',
    name: 'goal',
    component: GoalPage
  },
  {
    path: '/tutorial',
    name: 'tutorial',
    component: TutorialPage
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksPage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
