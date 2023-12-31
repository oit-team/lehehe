import type { RouteConfig } from 'vue-router'
import { defineComponent } from 'vue'

const Container = defineComponent({
  render: h => h('router-view'),
})

export const routes: RouteConfig[] = [
  {
    path: '/test',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  // 大屏相关(设备管理、商品展览、商品资源)
  {
    path: '/live-stream/carousel-resources/list',
    name: 'CarouselResourcesList',
    component: () => import ('@/views/LiveStream/CarouselResources/List.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/carousel/list',
    name: 'LiveStreamCarouselList',
    component: () => import ('@/views/LiveStream/Carousel/List.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/device/list',
    name: 'LiveStreamDeviceList',
    component: () => import ('@/views/LiveStream/Device/List.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/live-stream/carousel/update',
    name: 'LiveStreamCarouselUpdate',
    component: () => import ('@/views/LiveStream/Carousel/Update.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/carousel/public-release',
    name: 'PublicRelease',
    component: () => import ('@/views/LiveStream/Carousel/PublicRelease.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/carousel/pay-success',
    name: 'PaySuccess',
    component: () => import ('@/views/LiveStream/Carousel/PaySuccess.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/carousel/pay-fail',
    name: 'PayFailing',
    component: () => import ('@/views/LiveStream/Carousel/PayFailing.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/carousel-resources/upload',
    name: 'CarouselResourcesUpload',
    component: () => import ('@/views/LiveStream/CarouselResources/Upload.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/room/list',
    name: 'LiveStreamRoomList',
    component: () => import ('@/views/LiveStream/Room/List.vue'),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: '/live-stream/room/update',
    name: 'LiveStreamRoomUpdate',
    component: () => import ('@/views/LiveStream/Room/Update.vue'),
    meta: {
      keepAlive: false,
    },
  },
  {
    path: '/live-stream/content-review/list',
    name: 'LiveStreamContentReviewList',
    component: () => import ('@/views/LiveStream/ContentReview/List.vue'),
    meta: {
      keepAlive: true,
    },
  },
  // 系统设置相关（菜单管理、品牌入驻）（角色管理迁移到main）
  {
    path: '/menu/menuList',
    name: 'menuList',
    component: () => import ('@/components/menu/menuList.vue'),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: '/menu/addMenu',
    name: 'addMenu',
    component: () => import ('@/components/menu/addMenu.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/brandList',
    name: 'brandList',
    component: () => import ('@/components/brand/brandList.vue'),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/addBrand',
    name: 'addBrand',
    component: () => import ('@/components/brand/addBrand.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/editBrand',
    name: 'editBrand',
    component: () => import ('@/components/brand/editBrand.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/brandInteManage',
    name: 'brandInteManage',
    component: () => import ('@/components/brand/brandInteManage.vue'),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/addUser',
    name: 'addUser',
    component: () => import ('@/components/brand/addUser.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/goodsList',
    name: 'goodsList',
    component: () => import ('@/components/brand/goodsList.vue'),
    meta: {
      keepAlive: true,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/addGoods',
    name: 'addGoods',
    component: () => import ('@/components/brand/addGoods.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/goodStock',
    name: 'goodStock',
    component: () => import ('@/components/brand/goodStock.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/pay-success',
    name: 'IntegralPaySuccess',
    component: () => import ('@/components/brand/integralPaySuccess.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
  {
    path: '/brand/pay-fail',
    name: 'IntegralPayFail',
    component: () => import ('@/components/brand/integralPayFail.vue'),
    meta: {
      keepAlive: false,
      requiresAuth: true,
    },
  },
]
