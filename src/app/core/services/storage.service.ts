import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private isReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // Si ya está inicializado, no hacer nada
    if (this._storage != null) {
      return;
    }
    const storage = await this.storage.create();
    this._storage = storage;
    this.isReady = true;
  }

  public async set(key: string, value: any): Promise<void> {
    if (!this.isReady) await this.init();
    await this._storage?.set(key, value);
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isReady) await this.init();
    return await this._storage?.get(key);
  }

  public async remove(key: string): Promise<void> {
    if (!this.isReady) await this.init();
    await this._storage?.remove(key);
  }

  public async clear(): Promise<void> {
    if (!this.isReady) await this.init();
    await this._storage?.clear();
  }
}
