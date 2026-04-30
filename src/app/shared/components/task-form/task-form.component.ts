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
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
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
      dueDate: [null],
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
        dueDate: this.task.dueDate || null,
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
