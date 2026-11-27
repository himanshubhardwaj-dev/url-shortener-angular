import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly EMAIL_KEY = 'auth_email';

  saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.removeItem(this.EMAIL_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  saveEmail(email: string): void {
    sessionStorage.setItem(this.EMAIL_KEY, email);
  }

  getEmail(): string | null {
    return sessionStorage.getItem(this.EMAIL_KEY);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.EMAIL_KEY);
  }
}