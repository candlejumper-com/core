export const routes = [
  {
    path: '',
    loadComponent: () => import('./lib/pages/page-home/page-home.component').then((mod) => mod.PageHomeComponent),
  },
  {
    path: 'insight',
    loadComponent: () => import('./lib/pages/page-insight/page-insight.component').then((mod) => mod.PageInsightComponent),
  },
  {
    path: 'ai',
    loadComponent: () => import('./lib/pages/page-ai/page-ai.component').then((mod) => mod.PageAIComponent),
  },
  {
    path: 'editor',
    loadComponent: () => import('./lib/pages/page-editor/page-editor.component').then((mod) => mod.PageEditorComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
]
