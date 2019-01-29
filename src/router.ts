import Vue from 'vue'
import Router from 'vue-router'
import Recommend from '@/views/Recommend.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
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
          component: () =>
            import(/* webpackChunkName: "disc" */ './views/Disc.vue')
        }
      ]
    },
    {
      path: '/singer',
      name: 'singer',
      component: () =>
        import(/* webpackChunkName: "singer" */ './views/Singer.vue'),
      children: [
        {
          path: ':id',
          component: () =>
            import(/* webpackChunkName: "singerDetail" */ './views/SingerDetail.vue'),
        }
      ]
    },
    {
      path: '/rank',
      name: 'rank',
      component: () => import(/* webpackChunkName: "rank" */ './views/Rank.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () =>
        import(/* webpackChunkName: "search" */ './views/Search.vue')
    }
  ]
})
