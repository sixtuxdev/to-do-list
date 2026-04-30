import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
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
