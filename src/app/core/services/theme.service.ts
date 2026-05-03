import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private isDarkMode = new BehaviorSubject<boolean>(false);

  // Expose observable for components to bind to
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor(private storageService: StorageService) {}

  async initializeTheme() {
    const savedTheme = await this.storageService.get(this.THEME_KEY);
    
    if (savedTheme !== null) {
      this.setTheme(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.setTheme(prefersDark.matches);
      
      prefersDark.addEventListener('change', (mediaQuery) => {
        this.setTheme(mediaQuery.matches);
      });
    }
  }

  get isDark(): boolean {
    return this.isDarkMode.value;
  }

  async toggleTheme() {
    const newVal = !this.isDarkMode.value;
    await this.storageService.set(this.THEME_KEY, newVal ? 'dark' : 'light');
    this.setTheme(newVal);
  }

  private setTheme(isDark: boolean) {
    this.isDarkMode.next(isDark);
    if (isDark) {
      document.body.classList.add('dark');
      document.body.setAttribute('color-theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.body.setAttribute('color-theme', 'light');
    }
  }
}
