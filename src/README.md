# JBAC Frontend Web Portal (Jesus Believers Association Council)

This repository hosts the responsive frontend user portal for the JBAC network. Built with an architecture utilizing Angular Material, customized Bootstrap skins, and dynamic slider frameworks, it feeds real-time community records straight from our hosted API layer.

## 🧱 Project Architecture & Key Registrations Folder Structure
The portal layout maps roles natively inside the project tree (`src/app/jesus/`):
- 👥 **Believer Registration:** `src/app/jesus/believerregister/`
- 💼 **Pastor Directory:** `src/app/jesus/pastorregister/`
- ⛪ **Church Profiler:** `src/app/jesus/churchregister/`
- 🏢 **Organisation Registry:** `src/app/jesus/organisationregister/`
- 🛡️ **Ministry Directory:** `src/app/jesus/ministryregister/`
- 🎓 **Student System:** `src/app/jesus/studentregister/`
- 🌐 **Pastor Association Portal:** `src/app/jesus/pastorassociationregister/`

---

## ⚡ Global Shared Registration Service Pipeline
To change and update all multi-role registration forms simultaneously instead of copying long HTTP codes across directories, the project utilizes a single master data service bridge: **`RegistrationService`** (`src/app/core/services/registration.service.ts`).

This unified service pipeline uses an open structure to push various form datasets to the cloud with one master block:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  constructor(private http: HttpClient) { }

  public saveRegistration(type: string, data: any): Observable<any> {
    const targetUrl = `${environment.apiUrl}/register-all`;
    const payload = { registrationType: type, ...data };
    return this.http.post(targetUrl, payload);
  }
}
```

---

## 🔌 Integrating Forms inside Component Scripts

To integrate this master service link inside any individual form layout grid component, use this standardized setup blueprint inside your target `.ts` file:

```typescript
import { Component } from '@angular/core';
import { RegistrationService } from '../../core/services/registration.service';

@Component({
  selector: 'app-believerregister',
  templateUrl: './believerregister.component.html'
})
export class BelieverregisterComponent {
  public myForm = { firstName: '', lastName: '', email: '', phone: '', nativePlace: '' };

  constructor(private apiService: RegistrationService) {}

  public submitForm(): void {
    this.apiService.saveRegistration('believer', this.myForm).subscribe({
      next: () => { 
        alert('⛪ Registration profile successfully processed and saved to AWS!'); 
        this.myForm = { firstName: '', lastName: '', email: '', phone: '', nativePlace: '' }; 
      },
      error: (err) => alert('Sync failed: ' + err.message)
    });
  }
}
```

---

## 🌐 Production Environment Setup
The public deployment environment endpoints mapping configurations must point straight to your hosted AWS Elastic Beanstalk web server endpoint.

Open `src/environments/environment.prod.ts` (or `environment.ts` if creating the directory manually via `src/environments/`) and configure your fields cleanly:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://YOUR_AWS_ELASTIC_BEANSTALK_URL_HERE/api' // Do not append trailing slashes
};
```

---

## 🚀 Running Compilation Builds Locally

### 1. Build & Generate Environments (If folder layout is missing)
```bash
cd ~/jbac_core
npx ng generate environments
```

### 2. Boot Local Server with Network Proxy Permissions
```bash
npm install
npm run start -- --host 0.0.0.0 --port 8080 --disable-host-check
```
Open up Google Cloud Shell's **Web Preview over port 8080** to test your entire interface dynamically!

### 3. Deploy Live permanently to AWS Amplify Hosting
Push your code files up to your main repository branch using git tracks:
```bash
git add .
git commit -m "Configure master shared service pipeline targets"
git push origin main
```
Connect your repository branch straight inside the **AWS Amplify Management Hosting Console** (Sydney region) to trigger automatic global content delivery building!
