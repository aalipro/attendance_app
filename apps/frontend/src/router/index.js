import { createRouter, createWebHistory } from 'vue-router';

import ClassesList from '../pages/ClassesList.vue';
import ClassDetail from '../pages/ClassDetail.vue';
import SessionsList from '../pages/SessionsList.vue';
import SessionDetail from '../pages/SessionDetail.vue';
import StatsPage from '../pages/StatsPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';
import Login from '../pages/Login.vue';
import Signup from '../pages/Signup.vue';

const routes = [
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/signup', component: Signup, meta: { public: true } },
  { path: '/', redirect: '/classes' },
  { path: '/classes', component: ClassesList },
  { path: '/classes/:id', component: ClassDetail, props: true },
  { path: '/sessions', component: SessionsList },
  { path: '/sessions/:id', component: SessionDetail, props: true },
  { path: '/stats', component: StatsPage },
  { path: '/settings', component: SettingsPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; }
});

router.beforeEach((to, _from, next) => {
  if (to.meta.public) return next();
  const token = localStorage.getItem('auth_token');
  if (!token) return next({ path: '/login', query: { redirect: to.fullPath } });
  next();
});

export default router;
