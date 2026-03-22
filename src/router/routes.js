const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'saves', component: () => import('pages/SavesPage.vue') },
      { path: 'office', component: () => import('pages/OfficePage.vue') },
      { path: 'research', component: () => import('pages/ResearchPage.vue') },
      { path: 'design', component: () => import('pages/DesignPage.vue') },
      { path: 'manufacturing', component: () => import('pages/ManufacturingPage.vue') },
      { path: 'marketing', component: () => import('pages/MarketingPage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
