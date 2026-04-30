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
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss'],
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
