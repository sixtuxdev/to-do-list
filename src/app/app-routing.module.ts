import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks.page').then(m => m.TasksPage)
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage)
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
