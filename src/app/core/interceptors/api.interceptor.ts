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

// List of read-only master data endpoints where fallback to legacy server or local data is safe for UI dropdowns
const READONLY_MASTER_ENDPOINTS = new Set([
  'denomations',
  'leaderlevels',
  'getdistricts',
  'getmdistricts',
  'getmandals',
  'getmmandals',
  'gepanchayati',
  'getservices',
  'pattern',
  'getinstitutes',
  'educationalq',
  'getwing',
  'getconsistencys',
  'getmconsistencys'
]);

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiedUrl = request.url;
    const isHttps = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';

    // Check for runtime configured API URL (e.g. AWS CloudFront HTTPS endpoint stored in localStorage)
    let runtimeApiUrl: string | null = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      runtimeApiUrl = window.localStorage.getItem('JBAC_API_URL');
      if (runtimeApiUrl) {
        runtimeApiUrl = runtimeApiUrl.replace(/\/+$/, '');
      }
    }

    // If a custom HTTPS backend URL is provided at runtime or in environment, prioritize it
    const activeHttpsBackend = runtimeApiUrl?.startsWith('https:')
      ? runtimeApiUrl
      : (environment?.apiUrl?.startsWith('https:') ? environment.apiUrl.replace(/\/+$/, '') : null);

    if (activeHttpsBackend) {
      if (modifiedUrl.startsWith('/dashboardapi/')) {
        modifiedUrl = `${activeHttpsBackend}${modifiedUrl}`;
      } else if (modifiedUrl.startsWith('/api/')) {
        modifiedUrl = `${activeHttpsBackend}${modifiedUrl}`;
      } else if (modifiedUrl.startsWith('http://')) {
        const path = modifiedUrl.replace(/^http:\/\/[^/]+/, '');
        modifiedUrl = `${activeHttpsBackend}${path}`;
      }
    } else if (isHttps && modifiedUrl.startsWith('http://')) {
      // Running on HTTPS (AWS Amplify) with an HTTP backend:
      // Browser blocks direct HTTP as Mixed Content.
      // Route via relative path so reverse proxy can handle it if configured
      if (modifiedUrl.includes('/dashboardapi/')) {
        modifiedUrl = modifiedUrl.substring(modifiedUrl.indexOf('/dashboardapi/'));
      } else if (modifiedUrl.includes('/api/')) {
        modifiedUrl = modifiedUrl.substring(modifiedUrl.indexOf('/api/'));
      } else if (modifiedUrl.includes('/register-member')) {
        modifiedUrl = '/api/register-member';
      }
    }

    const clonedRequest = request.clone({ url: modifiedUrl });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Extract the endpoint name (e.g., 'postbeliversignup', 'getdistricts')
        const urlParts = clonedRequest.url.split('/');
        const endpointName = urlParts[urlParts.length - 1].split('?')[0];

        // CRITICAL SECURITY RULE:
        // NEVER retry mutations / registrations against fallback legacy server!
        // All user submissions (believer, pastor, church, student, etc.) must ONLY go to user's AWS backend!
        const isReadOnlyMasterQuery = READONLY_MASTER_ENDPOINTS.has(endpointName) || clonedRequest.method === 'GET';

        if (
          isReadOnlyMasterQuery &&
          isHttps &&
          (clonedRequest.url.includes('/dashboardapi/') || clonedRequest.url.startsWith('/dashboardapi/')) &&
          !clonedRequest.url.startsWith('https://jbac.in')
        ) {
          const fallbackBase = (environment && (environment as any).fallbackApiUrl)
            ? (environment as any).fallbackApiUrl.replace(/\/+$/, '')
            : 'https://jbac.in:9762/dashboardapi';
          const path = clonedRequest.url.substring(clonedRequest.url.indexOf('/dashboardapi/'));
          const fallbackUrl = `${fallbackBase}${path.replace('/dashboardapi', '')}`;
          console.warn(`[ApiInterceptor] Read-only master query ${endpointName} failed on primary. Retrying fallback ${fallbackUrl}`);
          const fallbackReq = clonedRequest.clone({ url: fallbackUrl });
          return next.handle(fallbackReq);
        }

        // For write operations / registrations: Do NOT divert data. Log and propagate the error.
        if (!isReadOnlyMasterQuery) {
          console.error(`[ApiInterceptor] Registration/Mutation to ${clonedRequest.url} failed. Error details:`, {
            status: error.status,
            statusText: error.statusText,
            url: clonedRequest.url,
            message: error.message
          });
        }

        return throwError(() => error);
      })
    );
  }
}
