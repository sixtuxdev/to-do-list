export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  priority: TaskPriority;
  dueDate?: string; // ISO format
  createdAt: string;
  updatedAt: string;
}
