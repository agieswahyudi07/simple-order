import { createRouter, createWebHistory } from 'vue-router'
import Products from './pages/Products.vue'
import OrderForm from './pages/OrderForm.vue'
import Orders from './pages/Orders.vue'
import Login from './pages/Login.vue'

const routes = [
  { path: '/', component: Products },
  { path: '/order', component: OrderForm },
  { path: '/orders', component: Orders },
  { path: '/login', component: Login }
]

const router = createRouter({ history: createWebHistory(), routes })

export default router
