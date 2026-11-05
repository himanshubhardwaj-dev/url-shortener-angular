import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorage } from '../services/token-storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenStorage = inject(TokenStorage);
  const token = tokenStorage.getToken();

  console.log('Auth interceptor called:', req.url);
  console.log('Token found in interceptor:', !!token);

  if (!token) {
    return next(req);
  }

  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('Authorization header attached:', !!authRequest.headers.get('Authorization'));

  return next(authRequest);
};