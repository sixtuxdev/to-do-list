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
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
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
