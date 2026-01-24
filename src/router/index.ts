import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// 동적 import 실패 시 에러 핸들링을 위한 헬퍼 함수
const loadView = (view: string) => {
  return () => import(`../views/${view}.vue`).catch((error) => {
    console.error(`Failed to load ${view}:`, error)
    // 동적 import 실패 시 403 에러 페이지로 이동
    window.location.href = '/403'
    throw error
  })
}

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
      component: loadView('SampleView')
    },
    {
      path: '/join',
      name: 'join',
      component: loadView('JoinView')
    },
    {
      path: '/login',
      name: 'login',
      component: loadView('LoginView')
    },
    {
      path: '/document',
      name: 'document',
      component: loadView('DocumentView')
    },
    {
      path: '/my-info',
      name: 'my-info',
      component: loadView('MyInfoView')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: loadView('DashboardView')
    },
    {
      path: '/vacation-application',
      name: 'vacation-application',
      component: loadView('VacationApplicationView')
    },
    {
      path: '/vacation-application/:seq',
      name: 'vacation-application-edit',
      component: loadView('VacationApplicationView')
    },
    {
      path: '/expense-application',
      name: 'expense-application',
      component: loadView('ExpenseApplicationView')
    },
    {
      path: '/expense-application/:seq',
      name: 'expense-application-edit',
      component: loadView('ExpenseApplicationView')
    },
    {
      path: '/rental-application',
      name: 'rental-application',
      component: loadView('RentalApplicationView')
    },
    {
      path: '/rental-application/:seq',
      name: 'rental-application-edit',
      component: loadView('RentalApplicationView')
    },
    {
      path: '/my-applications',
      name: 'my-applications',
      component: loadView('MyApplicationsView')
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: loadView('UserManagementView')
    },
    {
      path: '/user-management/:userId',
      name: 'user-detail',
      component: loadView('UserDetailView')
    },
    {
      path: '/team-management',
      name: 'team-management',
      component: loadView('TeamManagementView'),
      beforeEnter: (_to, _from, next) => {
        // 권한 체크: ma만 접근 가능
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user && user.authVal === 'ma') {
              next()
              return
            }
          } catch (e) {
            console.error('Failed to parse user data:', e)
          }
        }
        // 권한이 없으면 403 페이지로 이동
        next('/403')
      }
    },
    {
      path: '/approval-list',
      name: 'approval-list',
      component: loadView('ApprovalListView'),
      beforeEnter: (_to, _from, next) => {
        // 권한 체크: tj, bb, ma만 접근 가능
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user && user.authVal && (user.authVal === 'tj' || user.authVal === 'bb' || user.authVal === 'ma')) {
              next()
              return
            }
          } catch (e) {
            console.error('Failed to parse user data:', e)
          }
        }
        // 권한이 없으면 403 페이지로 이동
        next('/403')
      }
    },
    {
      path: '/application-success',
      name: 'application-success',
      component: loadView('ApplicationSuccessView')
    },
    {
      path: '/403',
      name: 'error-403',
      component: loadView('Error403View')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/403'
    }
  ]
})

export default router

