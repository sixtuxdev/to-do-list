import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController, AlertController, NavController } from '@ionic/angular';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

import { Task } from '../../core/interfaces/task.interface';
import { Category } from '../../core/interfaces/category.interface';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { RemoteConfigService } from '../../core/services/remote-config.service';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';
import { TaskFormComponent } from '../../shared/components/task-form/task-form.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TaskItemComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-title>Mis Tareas</ion-title>
        <ion-buttons slot="end">
          <ion-button *ngIf="enableCategories$ | async" (click)="goToCategories()">
            <ion-icon slot="icon-only" name="folder-open-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="openTaskModal()">
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar color="primary">
        <ion-searchbar 
          animated="true" 
          placeholder="Buscar tareas..." 
          (ionInput)="onSearch($event)"
          [debounce]="300">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding-vertical">
      
      <!-- Category Filter -->
      <div class="category-filter-container" *ngIf="enableCategories$ | async">
        <ion-chip 
          [outline]="(categoryFilter$ | async) !== null"
          [color]="(categoryFilter$ | async) === null ? 'primary' : 'medium'"
          (click)="setCategoryFilter(null)">
          <ion-label>Todas</ion-label>
        </ion-chip>
        <ion-chip 
          *ngFor="let category of categories$ | async"
          [outline]="(categoryFilter$ | async) !== category.id"
          [style.--ion-color-primary]="category.color"
          [color]="(categoryFilter$ | async) === category.id ? 'primary' : 'medium'"
          (click)="setCategoryFilter(category.id)">
          <ion-icon [name]="category.icon"></ion-icon>
          <ion-label>{{ category.name }}</ion-label>
        </ion-chip>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="(filteredTasks$ | async)?.length === 0">
        <ion-icon name="list-circle-outline" color="medium"></ion-icon>
        <h3>No hay tareas</h3>
        <p>Agrega una nueva tarea para comenzar.</p>
        <ion-button fill="outline" (click)="openTaskModal()">Crear Tarea</ion-button>
      </div>

      <!-- Task List -->
      <ion-list *ngIf="(filteredTasks$ | async)?.length! > 0">
        <ion-list-header>
          <ion-label>Pendientes</ion-label>
        </ion-list-header>
        
        <ng-container *ngFor="let task of filteredTasks$ | async; trackBy: trackByFn">
          <app-task-item 
            *ngIf="!task.completed"
            [task]="task" 
            (edit)="openTaskModal(task)"
            (delete)="confirmDelete($event)"
            (toggleComplete)="toggleComplete($event)">
          </app-task-item>
        </ng-container>

        <!-- Completed Tasks (could be folded in a real app) -->
        <ion-list-header class="ion-margin-top">
          <ion-label color="medium">Completadas</ion-label>
        </ion-list-header>

        <ng-container *ngFor="let task of filteredTasks$ | async; trackBy: trackByFn">
          <app-task-item 
            *ngIf="task.completed"
            [task]="task" 
            (edit)="openTaskModal(task)"
            (delete)="confirmDelete($event)"
            (toggleComplete)="toggleComplete($event)">
          </app-task-item>
        </ng-container>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="openTaskModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60%;
      text-align: center;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 80px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      h3 {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--ion-color-dark);
      }
    }
    .category-filter-container {
      display: flex;
      overflow-x: auto;
      padding: 0 16px 8px;
      gap: 8px;
    }
    .category-filter-container::-webkit-scrollbar {
      display: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksPage implements OnInit {
  searchQuery$ = new BehaviorSubject<string>('');
  categoryFilter$ = new BehaviorSubject<string | null>(null);
  
  filteredTasks$!: Observable<Task[]>;
  categories$!: Observable<Category[]>;
  enableCategories$!: Observable<boolean>;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private remoteConfigService: RemoteConfigService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.categories$ = this.categoryService.getCategories();
    this.enableCategories$ = this.remoteConfigService.enableCategories$;
    
    this.filteredTasks$ = combineLatest([
      this.searchQuery$,
      this.categoryFilter$.pipe(startWith(null))
    ]).pipe(
      switchMap(([query, category]) => this.taskService.searchTasks(query, category || undefined))
    );
  }

  setCategoryFilter(categoryId: string | null) {
    this.categoryFilter$.next(categoryId);
  }

  goToCategories() {
    this.navCtrl.navigateForward('/categories');
  }

  onSearch(event: any) {
    this.searchQuery$.next(event.target.value || '');
  }

  trackByFn(index: number, task: Task): string {
    return task.id;
  }

  async openTaskModal(task?: Task) {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: { task },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (task) {
        this.taskService.updateTask(task.id, data);
        this.showToast('Tarea actualizada correctamente');
      } else {
        this.taskService.addTask(data);
        this.showToast('Tarea creada correctamente');
      }
    }
  }

  async confirmDelete(taskId: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar Tarea?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteTask(taskId);
            this.showToast('Tarea eliminada');
          }
        }
      ]
    });
    await alert.present();
  }

  toggleComplete(taskId: string) {
    this.taskService.toggleTaskCompletion(taskId);
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
