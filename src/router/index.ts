import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    // 저장된 위치가 있으면 (뒤로가기 등) 그 위치로 이동
    if (savedPosition) {
      return savedPosition
    }
    // 페이지 이동 시 항상 맨 위로 스크롤
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: (_to, _from, next) => {
        // 로그인한 상태면 dashboard로 리다이렉트
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user && user.userId) {
              next('/dashboard')
              return
            }
          } catch (e) {
            console.error('Failed to parse user data:', e)
          }
        }
        next()
      }
    },
    {
      path: '/sample',
      name: 'sample',
      component: () => import('../views/SampleView.vue')
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('../views/JoinView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/document',
      name: 'document',
      component: () => import('../views/DocumentView.vue')
    },
    {
      path: '/my-info',
      name: 'my-info',
      component: () => import('../views/MyInfoView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/vacation-application',
      name: 'vacation-application',
      component: () => import('../views/VacationApplicationView.vue')
    },
    {
      path: '/expense-application',
      name: 'expense-application',
      component: () => import('../views/ExpenseApplicationView.vue')
    },
    {
      path: '/rental-application',
      name: 'rental-application',
      component: () => import('../views/RentalApplicationView.vue')
    },
    {
      path: '/my-applications',
      name: 'my-applications',
      component: () => import('../views/MyApplicationsView.vue')
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../views/UserManagementView.vue')
    },
    {
      path: '/user-management/:userId',
      name: 'user-detail',
      component: () => import('../views/UserDetailView.vue')
    },
    {
      path: '/application-success',
      name: 'application-success',
      component: () => import('../views/ApplicationSuccessView.vue')
    },
    {
      path: '/403',
      name: 'error-403',
      component: () => import('../views/Error403View.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/403'
    }
  ]
})

export default router

