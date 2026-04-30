import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '../../../core/interfaces/task.interface';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { RemoteConfigService } from '../../../core/services/remote-config.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, CategorySelectorComponent],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ task ? 'Editar Tarea' : 'Nueva Tarea' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        
        <ion-item class="form-item">
          <ion-label position="stacked">Título <ion-text color="danger">*</ion-text></ion-label>
          <ion-input formControlName="title" placeholder="Ej. Comprar víveres" clearInput></ion-input>
        </ion-item>
        <ion-note color="danger" *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
          El título es obligatorio.
        </ion-note>

        <ion-item class="form-item">
          <ion-label position="stacked">Descripción</ion-label>
          <ion-textarea formControlName="description" placeholder="Detalles de la tarea..." autoGrow></ion-textarea>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Prioridad</ion-label>
          <ion-select formControlName="priority" interface="popover">
            <ion-select-option value="low">Baja</ion-select-option>
            <ion-select-option value="medium">Media</ion-select-option>
            <ion-select-option value="high">Alta</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="form-item">
          <ion-label position="stacked">Fecha límite</ion-label>
          <ion-datetime-button datetime="datetime"></ion-datetime-button>
          
          <ion-modal [keepContentsMounted]="true">
            <ng-template>
              <ion-datetime id="datetime" formControlName="dueDate" presentation="date"></ion-datetime>
            </ng-template>
          </ion-modal>
        </ion-item>

        <ion-item class="form-item" lines="none" *ngIf="enableCategories$ | async">
          <ion-label position="stacked">Categoría</ion-label>
          <app-category-selector formControlName="categoryId"></app-category-selector>
        </ion-item>

        <div class="ion-margin-top action-buttons">
          <ion-button expand="block" type="submit" [disabled]="taskForm.invalid">
            {{ task ? 'Actualizar' : 'Guardar' }} Tarea
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .form-item {
      --background: transparent;
      margin-bottom: 10px;
      --border-color: var(--ion-color-light-shade);
    }
    ion-note {
      font-size: 12px;
      margin-left: 16px;
    }
    .action-buttons {
      margin-top: 32px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  
  taskForm: FormGroup;
  enableCategories$!: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private remoteConfigService: RemoteConfigService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium' as TaskPriority],
      dueDate: [''],
      categoryId: [null],
      completed: [false]
    });
  }

  ngOnInit() {
    this.enableCategories$ = this.remoteConfigService.enableCategories$;

    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        priority: this.task.priority,
        dueDate: this.task.dueDate || '',
        categoryId: this.task.categoryId || null,
        completed: this.task.completed
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.modalCtrl.dismiss(this.taskForm.value, 'confirm');
    }
  }
}
