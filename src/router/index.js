import { createRouter, createWebHistory } from "vue-router";
import Recommend from "@/views/Recommend"; // 首页不用懒加载

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/recommend",
    },
    {
      path: "/recommend",
      component: Recommend,
      children: [
        {
          path: ":id",
          component: () =>
            import(/* webpackChunkName: "Disc" */ "@/views/Disc"),
        },
      ],
    },
    {
      path: "/singer",
      component: () =>
        import(/* webpackChunkName: "Singer" */ "@/views/Singer"),
      children: [
        {
          path: ":id",
          component: () =>
            import(
              /* webpackChunkName: "SingerDetail" */ "@/views/SingerDetail"
            ),
        },
      ],
    },
    {
      path: "/rank",
      component: () => import(/* webpackChunkName: "Rank" */ "@/views/Rank"),
      children: [
        {
          path: ":id",
          component: () =>
            import(/* webpackChunkName: "TopList" */ "@/views/TopList"),
        },
      ],
    },
    {
      path: "/search",
      component: () =>
        import(/* webpackChunkName: "Search" */ "@/views/Search"),
      children: [
        {
          path: ":id",
          component: () =>
            import(
              /* webpackChunkName: "SingerDetail" */ "@/views/SingerDetail"
            ),
        },
      ],
    },
    {
      path: "/user",
      component: () =>
        import(/* webpackChunkName: "UserCenter" */ "@/views/UserCenter"),
    },
  ],
});

export default router;
