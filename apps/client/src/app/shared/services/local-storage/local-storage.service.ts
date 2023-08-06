import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  get(key: string): any {
    const item = localStorage.getItem(key)

    if (typeof item === 'undefined') {
      return
    }

    try {
      return JSON.parse(item)
    } catch (error) {
      return item
    }
  }

  set(key: string, data: any): void {
    try {
      if (typeof data === 'object' || Array.isArray(data)) {
        data = JSON.stringify(data)
      }

      localStorage.setItem(key, data)
    } catch (error) {
      console.error(error)
    }
  }

  delete(key: string): void {
    localStorage.removeItem(key)
  }
}
