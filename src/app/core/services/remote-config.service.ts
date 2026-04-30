import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private enableCategoriesSubject = new BehaviorSubject<boolean>(true); // Default true
  public enableCategories$ = this.enableCategoriesSubject.asObservable();

  constructor() {
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      // Solo inicializa si no existe (importante para evitar errores en HMR o recargas)
      const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
      const remoteConfig = getRemoteConfig(app);
      
      // En desarrollo, reducimos el tiempo de caché para pruebas
      remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? 3600000 : 10000;
      
      // Valores por defecto antes de hacer el fetch
      remoteConfig.defaultConfig = {
        'enable_categories': true
      };

      // Obtener y activar los valores de Firebase
      await fetchAndActivate(remoteConfig);
      
      const enableCategories = getValue(remoteConfig, 'enable_categories').asBoolean();
      this.enableCategoriesSubject.next(enableCategories);
      
      console.log('Remote Config cargado: enable_categories =', enableCategories);
    } catch (error) {
      console.warn('Firebase Remote Config falló. Usando valores por defecto.', error);
      // Fallback seguro en caso de error de red o falta de configuración real
      this.enableCategoriesSubject.next(true);
    }
  }

  public get enableCategories(): boolean {
    return this.enableCategoriesSubject.getValue();
  }
}
