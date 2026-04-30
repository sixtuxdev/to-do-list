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
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Categorías</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openCategoryDialog()">
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <ion-list>
        <ion-item-sliding *ngFor="let category of categories$ | async; trackBy: trackByFn" #slidingItem>
          
          <ion-item [button]="true" (click)="openCategoryDialog(category)">
            <ion-icon [name]="category.icon" slot="start" [style.color]="category.color"></ion-icon>
            <ion-label>
              <h2>{{ category.name }}</h2>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" (click)="confirmDelete(category.id, slidingItem)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>

        </ion-item-sliding>
      </ion-list>

      <div class="empty-state" *ngIf="(categories$ | async)?.length === 0">
        <ion-icon name="folder-open-outline" color="medium"></ion-icon>
        <h3>Sin Categorías</h3>
        <p>Crea tu primera categoría para organizar las tareas.</p>
      </div>

    </ion-content>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60%;
      text-align: center;
      color: var(--ion-color-medium);
      
      ion-icon {
        font-size: 80px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      h3 {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--ion-color-dark);
      }
    }
  `],
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
