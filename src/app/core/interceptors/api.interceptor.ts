import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiedUrl = request.url;
    const isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';

    // Prevent browser Mixed Content blocking when frontend is running on HTTPS:
    // Transform direct http:// calls to relative proxy paths so AWS Amplify can reverse proxy them securely.
    if (isHttps && modifiedUrl.startsWith('http://')) {
      if (modifiedUrl.includes('/dashboardapi/')) {
        const path = modifiedUrl.substring(modifiedUrl.indexOf('/dashboardapi/'));
        modifiedUrl = path;
      } else if (modifiedUrl.includes('/api/')) {
        const path = modifiedUrl.substring(modifiedUrl.indexOf('/api/'));
        modifiedUrl = path;
      } else if (modifiedUrl.includes('/register-member')) {
        modifiedUrl = '/api/register-member';
      }
    }

    const clonedRequest = request.clone({ url: modifiedUrl });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the primary endpoint fails (Mixed Content, 404, or HTML response from missing Amplify rewrite),
        // and this is a dashboardapi call not already targeting fallback:
        const fallbackBase = (environment && (environment as any).fallbackApiUrl)
          ? (environment as any).fallbackApiUrl.replace(/\/+$/, '')
          : 'https://jbac.in:9762/dashboardapi';

        if (
          isHttps &&
          (clonedRequest.url.includes('/dashboardapi/') || clonedRequest.url.startsWith('/dashboardapi/')) &&
          !clonedRequest.url.startsWith('https://jbac.in')
        ) {
          const path = clonedRequest.url.substring(clonedRequest.url.indexOf('/dashboardapi/'));
          const fallbackUrl = `${fallbackBase}${path.replace('/dashboardapi', '')}`;
          console.warn(`[ApiInterceptor] Request to ${clonedRequest.url} failed. Retrying with fallback ${fallbackUrl}`);
          const fallbackReq = clonedRequest.clone({ url: fallbackUrl });
          return next.handle(fallbackReq);
        }

        return throwError(() => error);
      })
    );
  }
}
