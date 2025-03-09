import { createRouter, createWebHistory } from 'vue-router';
import ToolGrid from '../components/ToolGrid.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: ToolGrid
  },
  {
    path: '/ai-chat',
    name: 'ai-chat',
    component: () => import('../views/AiChat.vue')
  },
  {
    path: '/json-formatter',
    name: 'json-formatter',
    component: () => import('../views/JsonFormatter.vue')
  },
  {
    path: '/md5',
    name: 'md5',
    component: () => import('../views/Md5.vue')
  },
  {
    path: '/url-codec',
    name: 'url-codec',
    component: () => import('../views/UrlCodec.vue')
  },
  {
    path: '/hex-converter',
    name: 'hex-converter',
    component: () => import('../views/HexConverter.vue')
  },
  {
    path: '/timestamp',
    name: 'timestamp',
    component: () => import('../views/Timestamp.vue')
  },
  {
    path: '/huaweicloud-token',
    name: 'huaweicloud-token',
    component: () => import('../views/HuaweicloudToken.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 