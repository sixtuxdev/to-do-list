import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RemoteConfigService } from './remote-config.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private isDarkMode = new BehaviorSubject<boolean>(false);
  private remoteConfigSub?: Subscription;

  // Expose observable for components to bind to
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor(
    private storageService: StorageService,
    private remoteConfigService: RemoteConfigService
  ) {}

  async initializeTheme() {
    // Listen to remote config changes
    this.remoteConfigSub = this.remoteConfigService.enableDarkMode$.subscribe(async (isEnabled) => {
      if (isEnabled) {
        // If dark mode is enabled remotely, apply user preference or system preference
        const savedTheme = await this.storageService.get(this.THEME_KEY);
        if (savedTheme !== null) {
          this.setTheme(savedTheme === 'dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
          this.setTheme(prefersDark.matches);
        }
      } else {
        // If dark mode is disabled remotely, force light mode
        this.setTheme(false);
      }
    });

    // Also listen for system changes if remote config allows it and no manual preference is set
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (mediaQuery) => {
      if (this.remoteConfigService.enableDarkMode) {
        const savedTheme = await this.storageService.get(this.THEME_KEY);
        if (savedTheme === null) {
          this.setTheme(mediaQuery.matches);
        }
      }
    });
  }

  get isDark(): boolean {
    return this.isDarkMode.value;
  }

  async toggleTheme() {
    if (!this.remoteConfigService.enableDarkMode) {
      return; // Prevent toggling if remotely disabled
    }
    const newVal = !this.isDarkMode.value;
    await this.storageService.set(this.THEME_KEY, newVal ? 'dark' : 'light');
    this.setTheme(newVal);
  }

  public setDarkMode(state: boolean) {
    if (!this.remoteConfigService.enableDarkMode) {
      return;
    }
    this.storageService.set(this.THEME_KEY, state ? 'dark' : 'light').then(() => {
      this.setTheme(state);
    });
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

  ngOnDestroy() {
    if (this.remoteConfigSub) {
      this.remoteConfigSub.unsubscribe();
    }
  }
}
