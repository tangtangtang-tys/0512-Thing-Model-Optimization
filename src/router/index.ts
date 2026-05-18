import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/iot/thing-model'
    },
    {
      path: '/iot/thing-model',
      name: 'ThingModelWorkspace',
      component: () => import('@/views/iot/ThingModelWorkspace.vue')
    }
  ]
});

export default router;
