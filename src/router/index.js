import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue'; // Import de la page d'accueil

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
