import { Component, forwardRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Category } from '../../../core/interfaces/category.interface';
import { CategoryService } from '../../../core/services/category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="category-container">
      <div 
        *ngFor="let category of categories$ | async" 
        class="category-badge"
        [class.selected]="value === category.id"
        [style.--cat-color]="category.color"
        (click)="selectCategory(category.id)">
        <ion-icon [name]="category.icon"></ion-icon>
        <span>{{ category.name }}</span>
      </div>
      <div 
        class="category-badge clear-badge"
        *ngIf="value"
        (click)="selectCategory(null)">
        <ion-icon name="close-circle-outline"></ion-icon>
        <span>Quitar</span>
      </div>
    </div>
  `,
  styles: [`
    .category-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 8px 0;
    }
    .category-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 20px;
      background: var(--ion-color-light);
      border: 2px solid transparent;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      opacity: 0.6;
    }
    .category-badge.selected {
      background: var(--cat-color);
      color: white;
      opacity: 1;
      transform: scale(1.05);
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .clear-badge {
      background: transparent;
      border: 1px dashed var(--ion-color-medium);
      color: var(--ion-color-medium);
    }
    ion-icon {
      font-size: 18px;
    }
    span {
      font-size: 14px;
      font-weight: 500;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategorySelectorComponent implements ControlValueAccessor, OnInit {
  categories$!: Observable<Category[]>;
  value: string | null = null;
  
  onChange = (val: string | null) => {};
  onTouch = () => {};

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categories$ = this.categoryService.getCategories();
  }

  selectCategory(id: string | null) {
    this.value = id;
    this.onChange(id);
    this.onTouch();
  }

  writeValue(val: string): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
