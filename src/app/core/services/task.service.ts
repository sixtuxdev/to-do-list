import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../interfaces/task.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    const savedTasks = await this.storageService.get<Task[]>('tasks');
    if (savedTasks) {
      this.tasksSubject.next(savedTasks);
    }
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    this.tasksSubject.next(tasks);
    await this.storageService.set('tasks', tasks);
  }

  public getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  public addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const currentTasks = this.tasksSubject.getValue();
    this.saveTasks([newTask, ...currentTasks]);
  }

  public updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.map(t => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    );
    this.saveTasks(updatedTasks);
  }

  public deleteTask(id: string): void {
    const currentTasks = this.tasksSubject.getValue();
    this.saveTasks(currentTasks.filter(t => t.id !== id));
  }

  public toggleTaskCompletion(id: string): void {
    const currentTasks = this.tasksSubject.getValue();
    const taskToToggle = currentTasks.find(t => t.id === id);
    if (taskToToggle) {
      this.updateTask(id, { completed: !taskToToggle.completed });
    }
  }

  public searchTasks(query: string, categoryId?: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => {
        let filtered = tasks;
        
        if (categoryId) {
          filtered = filtered.filter(t => t.categoryId === categoryId);
        }
        
        if (query.trim() !== '') {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(lowerQuery) || 
            (t.description && t.description.toLowerCase().includes(lowerQuery))
          );
        }
        
        return filtered;
      })
    );
  }
}
