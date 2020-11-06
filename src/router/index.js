import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login'
// import Home from '../components/home'
// import Welcome from '../components/welcome'
// import User from '../components/users/users'
// import Permission from '../components/permission/permissions'
// import Roles from '../components/permission/roles'
// import Categories from '../components/goods/categories'
// import Parameters from '../components/goods/parameters'
// import GoodList from '../components/goods/list'
// import Add from '../components/goods/add'
// import Order from '../components/orders/order'
// import Report from '../components/report/report'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/login')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/home')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/welcome')

const User = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/users/users')
const Permission = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/permission/permissions')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/permission/roles')

const Categories = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/categories')
const Parameters = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/parameters')

const GoodList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/list')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/add')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/orders/order')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/report')
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Permission },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Parameters },
      { path: '/goods', component: GoodList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
