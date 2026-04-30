import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Category } from '../../core/interfaces/category.interface';
import { CategoryService } from '../../core/services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesPage implements OnInit {
  categories$!: Observable<Category[]>;

  constructor(
    private categoryService: CategoryService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories$ = this.categoryService.getCategories();
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }

  trackByFn(index: number, item: Category): string {
    return item.id;
  }

  async openCategoryDialog(category?: Category) {
    const alert = await this.alertCtrl.create({
      header: category ? 'Editar Categoría' : 'Nueva Categoría',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
          value: category ? category.name : ''
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Color Hex (Ej. #ff0000)',
          value: category ? category.color : '#3880ff'
        },
        {
          name: 'icon',
          type: 'text',
          placeholder: 'Icono de Ionic (Ej. star)',
          value: category ? category.icon : 'folder-outline'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Guardar', 
          handler: (data) => this.saveCategory(data, category?.id)
        }
      ]
    });

    await alert.present();
  }

  private saveCategory(data: any, id?: string) {
    if (!data.name || data.name.trim() === '') {
      this.showToast('El nombre es obligatorio', 'danger');
      return false;
    }

    try {
      if (id) {
        this.categoryService.updateCategory(id, {
          name: data.name.trim(),
          color: data.color || '#3880ff',
          icon: data.icon || 'folder-outline'
        });
        this.showToast('Categoría actualizada');
      } else {
        this.categoryService.addCategory({
          name: data.name.trim(),
          color: data.color || '#3880ff',
          icon: data.icon || 'folder-outline'
        });
        this.showToast('Categoría creada');
      }
      return true;
    } catch (error: any) {
      this.showToast(error.message, 'danger');
      return false;
    }
  }

  async confirmDelete(id: string, slidingItem: any) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar Categoría?',
      message: 'Las tareas asociadas a esta categoría quedarán sin categoría asignada.',
      buttons: [
        { text: 'Cancelar', role: 'cancel', handler: () => slidingItem.close() },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: () => {
            this.categoryService.deleteCategory(id);
            this.showToast('Categoría eliminada');
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string = 'dark') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
