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

  private enableDarkModeSubject = new BehaviorSubject<boolean>(false); // Default false for safety
  public enableDarkMode$ = this.enableDarkModeSubject.asObservable();

  constructor() {
    this.initFirebase();
  }

  private async initFirebase() {
    try {
      const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
      const remoteConfig = getRemoteConfig(app);
      
      remoteConfig.settings.minimumFetchIntervalMillis = environment.production ? 3600000 : 10000;
      
      remoteConfig.defaultConfig = {
        'enable_categories': true,
        'enable_dark_mode': false
      };

      await fetchAndActivate(remoteConfig);
      
      const enableCategories = getValue(remoteConfig, 'enable_categories').asBoolean();
      this.enableCategoriesSubject.next(enableCategories);

      const enableDarkMode = getValue(remoteConfig, 'enable_dark_mode').asBoolean();
      this.enableDarkModeSubject.next(enableDarkMode);
      
      if (!environment.production) {
        console.log('Remote Config cargado: enable_categories =', enableCategories, 'enable_dark_mode =', enableDarkMode);
      }
    } catch (error) {
      console.warn('Firebase Remote Config falló. Usando valores por defecto.', error);
      this.enableCategoriesSubject.next(true);
      this.enableDarkModeSubject.next(false);
    }
  }

  public get enableCategories(): boolean {
    return this.enableCategoriesSubject.getValue();
  }

  public get enableDarkMode(): boolean {
    return this.enableDarkModeSubject.getValue();
  }
}
