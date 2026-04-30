import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../interfaces/category.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    const savedCategories = await this.storageService.get<Category[]>('categories');
    if (savedCategories) {
      this.categoriesSubject.next(savedCategories);
    } else {
      // Default categories
      this.saveCategories([
        { id: '1', name: 'Trabajo', color: '#3880ff', icon: 'briefcase-outline', createdAt: new Date().toISOString() },
        { id: '2', name: 'Personal', color: '#2dd36f', icon: 'person-outline', createdAt: new Date().toISOString() },
        { id: '3', name: 'Urgente', color: '#eb445a', icon: 'alert-circle-outline', createdAt: new Date().toISOString() }
      ]);
    }
  }

  private async saveCategories(categories: Category[]): Promise<void> {
    this.categoriesSubject.next(categories);
    await this.storageService.set('categories', categories);
  }

  public getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  public addCategory(category: Omit<Category, 'id' | 'createdAt'>): void {
    const currentCategories = this.categoriesSubject.getValue();
    
    // Duplicate validation (case-insensitive)
    const isDuplicate = currentCategories.some(
      c => c.name.toLowerCase() === category.name.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`La categoría "${category.name}" ya existe.`);
    }

    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    this.saveCategories([...currentCategories, newCategory]);
  }

  public updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): void {
    const currentCategories = this.categoriesSubject.getValue();
    
    if (updates.name) {
      const isDuplicate = currentCategories.some(
        c => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(`La categoría "${updates.name}" ya existe.`);
      }
    }

    const updatedCategories = currentCategories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    this.saveCategories(updatedCategories);
  }

  public deleteCategory(id: string): void {
    const currentCategories = this.categoriesSubject.getValue();
    this.saveCategories(currentCategories.filter(c => c.id !== id));
  }
}
