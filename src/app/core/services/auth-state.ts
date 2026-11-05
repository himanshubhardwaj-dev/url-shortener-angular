import { Injectable, computed, signal } from '@angular/core';

import { TokenStorage } from './token-storage';
import { CurrentUser } from '../../models/auth/current-user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthState {

    private currentUserSignal = signal<CurrentUser | null>(null);

    readonly currentUser = this.currentUserSignal.asReadonly();

    readonly isAuthenticated = computed(
        () => this.currentUserSignal() !== null
    );

    constructor(private tokenStorage: TokenStorage) {
        this.restoreSession();
    }

    setSession(token: string): void {

        const user = this.getUserFromToken(token);

        if (!user) {
            this.tokenStorage.clearToken();
            this.currentUserSignal.set(null);
            return;
        }

        this.tokenStorage.saveToken(token);
        this.currentUserSignal.set(user);
    }

    restoreSession(): void {

        const token = this.tokenStorage.getToken();


        if (!token) {
            return;
        }

        const user = this.getUserFromToken(token);


        if (!user) {
            this.tokenStorage.clearToken();
            this.currentUserSignal.set(null);
            return;
        }

        this.currentUserSignal.set(user);
    }

    logout(): void {
        this.tokenStorage.clearToken();
        this.currentUserSignal.set(null);
    }

    private getUserFromToken(token: string): CurrentUser | null {

        try {

            const payload = token.split('.')[1];

            if (!payload) {
                return null;
            }

            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

            const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

            const binary = atob(paddedBase64);

            const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));

            const decodedPayload = new TextDecoder().decode(bytes);

            const claims = JSON.parse(decodedPayload);

            if (!claims.exp || claims.exp * 1000 <= Date.now()) {
                return null;
            }

            const userId =
                claims.nameid ??
                claims.sub ??
                claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

            const email =
                claims.email ??
                claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

            const role =
                claims.role ??
                claims.roles ??
                claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (!userId || !email || !role) {
                return null;
            }

            return {
                userId: String(userId),
                email: String(email),
                role: Array.isArray(role) ? String(role[0]) : String(role)
            };

        } catch {
            return null;
        }
    }
}