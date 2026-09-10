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
    // Looks at your live AWS Elastic Beanstalk URL link automatically
    const endpoint = `${environment.apiUrl}/register-member`;

    // We package the type along with the data so the backend can tell who is registering
    const payload = {
      roleType: registrationType,
      ...formData
    };

    return this.http.post(endpoint, payload);
  }
}
