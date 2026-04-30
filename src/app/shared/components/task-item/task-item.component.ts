import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-item-sliding #slidingItem>
      <ion-item [button]="true" (click)="onEdit()" class="task-item" [class.completed]="task.completed">
        
        <ion-checkbox 
          slot="start" 
          [checked]="task.completed" 
          (ionChange)="onToggleCompletion($event)"
          (click)="$event.stopPropagation()">
        </ion-checkbox>
        
        <ion-label>
          <h2 [class.strikethrough]="task.completed">{{ task.title }}</h2>
          <p *ngIf="task.description" class="ion-text-wrap">{{ task.description }}</p>
          
          <div class="task-meta">
            <ion-badge [color]="getPriorityColor(task.priority)" class="priority-badge">
              {{ task.priority | uppercase }}
            </ion-badge>
            
            <ion-note *ngIf="task.dueDate" class="due-date" [color]="isOverdue(task.dueDate) && !task.completed ? 'danger' : 'medium'">
              <ion-icon name="calendar-outline"></ion-icon>
              {{ task.dueDate | date:'mediumDate' }}
            </ion-note>
          </div>
        </ion-label>

      </ion-item>

      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="onDelete(slidingItem)">
          <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
  styles: [`
    .strikethrough {
      text-decoration: line-through;
      color: var(--ion-color-medium);
    }
    .task-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .priority-badge {
      font-size: 10px;
      padding: 4px 6px;
    }
    .due-date {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .completed ion-label {
      opacity: 0.7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  @Output() toggleComplete = new EventEmitter<string>();

  onToggleCompletion(event: any) {
    this.toggleComplete.emit(this.task.id);
  }

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete(slidingItem: any) {
    this.delete.emit(this.task.id);
    slidingItem.close();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  }

  isOverdue(dateStr: string): boolean {
    return new Date(dateStr).getTime() < new Date().getTime();
  }
}
