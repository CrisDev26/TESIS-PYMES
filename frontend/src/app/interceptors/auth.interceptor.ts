import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el userId de localStorage
  const userId = localStorage.getItem('userId');
  
  if (userId) {
    // Clonar la petición y agregar el header X-User-Id
    const clonedRequest = req.clone({
      setHeaders: {
        'X-User-Id': userId
      }
    });
    return next(clonedRequest);
  }
  
  return next(req);
};
