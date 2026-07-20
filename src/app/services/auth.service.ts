import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'dashboard-auth';
  isAuthenticated = signal(false);

  constructor(private router: Router) {
    this.restoreSession();
  }

  login(email: string, password: string): boolean {
    if (email.trim() && password.trim()) {
      this.setStorage({ email: email.trim() });
      this.isAuthenticated.set(true);
      return true;
    }

    return false;
  }

  logout() {
    this.removeStorage();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private restoreSession() {
    const saved = this.getStorage();
    this.isAuthenticated.set(Boolean(saved));
  }

  private getStorage(): string | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.storageKey);
  }

  private setStorage(value: { email: string }) {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  private removeStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }
}
