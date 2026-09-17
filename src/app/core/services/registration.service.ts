import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private http: HttpClient) { }

  /**
   * Universal data pipeline that routes any church profile type straight to AWS Beanstalk!
   * @param registrationType The category label (e.g., 'believer', 'pastor', 'church')
   * @param formData The raw input data object from the user form layout
   */
  public submitRegistration(registrationType: string, formData: any): Observable<any> {
    let baseUrl = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      const customApi = window.localStorage.getItem('JBAC_API_URL');
      if (customApi) {
        baseUrl = customApi.replace(/\/+$/, '');
      }
    }

    if (!baseUrl) {
      baseUrl = environment.apiUrl ? environment.apiUrl.replace(/\/+$/, '') : 'http://jbac-backend-env.eba-rdpqwigp.ap-southeast-2.elasticbeanstalk.com';
    }

    const endpoint = `${baseUrl}/api/register-member`;

    // Package the role along with the form fields for unified ingestion
    const payload = {
      roleType: registrationType,
      ...formData
    };

    return this.http.post(endpoint, payload);
  }
}
