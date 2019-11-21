import Vue from 'vue'
import VueRouter from 'vue-router'
import Recommend from '../views/Recommend'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        component: () => import(/* webpackChunkName: "disc" */ '../views/Disc')
      }
    ]
  },
  {
    path: '/singer',
    name: 'singer',
    component: () => import(/* webpackChunkName: "singer" */ '../views/Singer'),
    children: [
      {
        path: ':id',
        component: () =>
          import(/* webpackChunkName: "singerDetail" */ '../views/SingerDetail')
      }
    ]
  },
  {
    path: '/rank',
    name: 'rank',
    component: () => import(/* webpackChunkName: "rank" */ '../views/Rank'),
    children: [
      {
        path: ':id',
        component: () =>
          import(/* webpackChunkName: "topList" */ '../views/TopList')
      }
    ]
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '../views/Search'),
    children: [
      {
        path: ':id',
        component: () =>
          import(/* webpackChunkName: "singerDetail" */ '../views/SingerDetail')
      }
    ]
  },
  {
    path: '/user',
    name: 'user',
    component: () =>
      import(/* webpackChunkName: "user" */ '../views/UserCenter')
  }
]

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
