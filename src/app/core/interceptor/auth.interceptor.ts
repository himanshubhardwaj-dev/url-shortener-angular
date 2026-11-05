import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorage } from '../services/token-storage';
import { environemnt } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const tokenStorage = inject(TokenStorage);
    const token = tokenStorage.getToken();

    const apiBaseUrl = `${environemnt.apiUrl}api/`;

    const isBackendApiRequest = req.url.startsWith(apiBaseUrl);

    const isPublicAuthRequest = /\/api\/Auth\/(login|register)$/i.test(req.url);

    if (!token || !isBackendApiRequest || isPublicAuthRequest) {
        return next(req);
    }

    const authRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authRequest);
};