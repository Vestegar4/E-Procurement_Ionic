import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('vendor_token');
  // Memanggil AuthService agar kita bisa menggunakan fungsi logout()-nya
  const authService = inject(AuthService);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }

  // Menangkap balasan dari server
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Jika server membalas dengan 401 (Unauthenticated / Token Mati)
      if (error.status === 401) {
        console.warn('Sesi telah kedaluwarsa. Melakukan auto-logout...');
        
        // Memanggil fungsi logout yang ada di AuthService 
        // (Ini akan otomatis menghapus token dan melempar ke halaman /login)
        authService.logout();
      }
      
      // Lemparkan error-nya kembali agar tidak merusak alur aplikasi
      return throwError(() => error);
    })
  );
};