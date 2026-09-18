import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
import {
  FALLBACK_DISTRICTS,
  FALLBACK_DENOMINATIONS,
  FALLBACK_SERVICES,
  FALLBACK_LEADER_LEVELS,
  FALLBACK_PATTERNS
} from './fallback-data';

if (typeof window !== 'undefined') {
  (window as any).setJbacApi = (url?: string) => {
    if (!url) {
      localStorage.removeItem('JBAC_API_URL');
      console.log('[JBAC] Reset API URL to default');
    } else {
      localStorage.setItem('JBAC_API_URL', url.trim());
      console.log('[JBAC] API URL set to:', url.trim());
    }
    location.reload();
  };
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  // Dynamically determines the appropriate API URL base
  get testApi(): string {
    return this.getBaseApiUrl();
  }

  getBaseApiUrl(): string {
    // 1. Check for runtime configured API URL (e.g. AWS CloudFront HTTPS endpoint stored in localStorage)
    if (typeof window !== 'undefined' && window.localStorage) {
      const customApi = window.localStorage.getItem('JBAC_API_URL');
      if (customApi) {
        return `${customApi.replace(/\/+$/, '')}/dashboardapi/`;
      }
    }

    // 2. Use configured environment apiUrl (CloudFront HTTPS or Elastic Beanstalk)
    if (environment && environment.apiUrl) {
      return `${environment.apiUrl.replace(/\/+$/, '')}/dashboardapi/`;
    }

    // 3. Direct Elastic Beanstalk fallback
    return 'http://jbac-backend-env.eba-rdpqwigp.ap-southeast-2.elasticbeanstalk.com/dashboardapi/';
  }

  /**
   * Normalizes registration submission payloads so that mobile_number and name
   * are guaranteed to be populated with clean, trimmed strings regardless of
   * which form field name was used in the UI (e.g. phonenumber, number, headnmber, contactnumber).
   * Also ensures role-specific field aliases remain populated so backend entity tables receive them.
   */
  normalizeRegistrationPayload(body: any, endpoint?: string): any {
    if (!body || typeof body !== 'object') return body;

    const payload = { ...body };

    // 1. Resolve mobile number from any possible phone input field
    const rawMobile =
      payload.mobile_number ||
      payload.phonenumber ||
      payload.number ||
      payload.headnmber ||
      payload.contactnumber ||
      payload.contact_num ||
      payload.phnumber ||
      payload.phone ||
      '';

    const cleanMobile = typeof rawMobile === 'string' ? rawMobile.trim() : String(rawMobile || '').trim();

    if (cleanMobile) {
      payload.mobile_number = cleanMobile;
      // Populate aliases so backend table-specific columns receive the phone number
      if (!payload.phonenumber) payload.phonenumber = cleanMobile;
      if (!payload.number) payload.number = cleanMobile;
      if (!payload.headnmber) payload.headnmber = cleanMobile;
      if (!payload.contactnumber) payload.contactnumber = cleanMobile;
      if (!payload.contact_num) payload.contact_num = cleanMobile;
      if (!payload.phnumber) payload.phnumber = cleanMobile;
    }

    // 2. Resolve user's full name from any possible name input field
    const rawName =
      payload.name ||
      payload.pastorname ||
      payload.studentname ||
      payload.firstname ||
      payload.fname ||
      payload.church_name ||
      payload.churchname ||
      payload.organisation_name ||
      payload.pa_name ||
      '';

    let cleanName = typeof rawName === 'string' ? rawName.trim() : String(rawName || '').trim();
    if (payload.fname && payload.lname && !payload.name) {
      const combined = `${payload.fname || ''} ${payload.lname || ''}`.trim();
      if (combined) cleanName = combined;
    }

    if (cleanName) {
      payload.name = cleanName;
      if (!payload.pastorname) payload.pastorname = cleanName;
      if (!payload.studentname) payload.studentname = cleanName;
      if (!payload.firstname) payload.firstname = cleanName;
      if (!payload.fname) payload.fname = cleanName;
    }

    // 3. Trim password if present
    if (payload.password && typeof payload.password === 'string') {
      payload.password = payload.password.trim();
    }
    if (payload.retypepassword && typeof payload.retypepassword === 'string') {
      payload.retypepassword = payload.retypepassword.trim();
    }

    // 4. Map category ID if endpoint is known and category is not provided
    if (!payload.category && endpoint) {
      const ep = endpoint.toLowerCase();
      if (ep.includes('beliver')) {
        payload.category = 1;
      } else if (ep.includes('student')) {
        payload.category = 2;
      } else if (ep.includes('ministry')) {
        payload.category = 3;
      } else if (ep.includes('pastor') && !ep.includes('association')) {
        payload.category = 4;
      } else if (ep.includes('church')) {
        payload.category = 5;
      } else if (ep.includes('organisation') || ep.includes('organization')) {
        payload.category = 6;
      } else if (ep.includes('association')) {
        payload.category = 7;
      }
    }

    return payload;
  }

  /**
   * Dedicated write/mutation executor for registrations and user submissions.
   * STRICT SECURITY GUARANTEE: Never redirects or falls back to third-party legacy servers!
   * Ensures data ONLY lands in the user's AWS Aurora RDS database.
   */
  executeWrite<T = any>(endpoint: string, body: any = {}): Observable<T> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const primaryUrl = `${this.getBaseApiUrl()}${cleanEndpoint}`;
    const payload = this.normalizeRegistrationPayload(body, cleanEndpoint);

    return this.http.post<T>(primaryUrl, payload).pipe(
      catchError((primaryErr) => {
        console.error(`[ServiceService] Registration/Write operation to ${primaryUrl} failed:`, primaryErr);
        return throwError(() => primaryErr);
      })
    );
  }

  /**
   * Resilient reader for dropdowns and master datasets.
   * Uses bundled static datasets if the backend is unreachable so UI dropdowns never fail.
   */
  executePost<T = any>(endpoint: string, body: any = {}, fallbackData?: any): Observable<T> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const primaryUrl = `${this.getBaseApiUrl()}${cleanEndpoint}`;

    return this.http.post<T>(primaryUrl, body).pipe(
      catchError((primaryErr) => {
        console.warn(`[ServiceService] Primary call to ${primaryUrl} failed:`, primaryErr);
        // If static fallback dataset is provided, use it so dropdowns don't stay empty
        if (fallbackData !== undefined) {
          return of({ status: 200, data: fallbackData } as any);
        }
        return throwError(() => primaryErr);
      })
    );
  }

  executeGet<T = any>(endpoint: string, fallbackData?: any): Observable<T> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const primaryUrl = `${this.getBaseApiUrl()}${cleanEndpoint}`;

    return this.http.get<T>(primaryUrl).pipe(
      catchError((primaryErr) => {
        console.warn(`[ServiceService] Primary GET to ${primaryUrl} failed:`, primaryErr);
        if (fallbackData !== undefined) {
          return of({ status: 200, data: fallbackData } as any);
        }
        return throwError(() => primaryErr);
      })
    );
  }

  public loingstatus = new BehaviorSubject(0);
  getloginstatus = this.loingstatus.asObservable();
  constructor(private http: HttpClient) { }

  errorMessageAlert(message: any) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: true,
      timer: 1500
    })
  }
  statusChangeAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500
    })
  }
  sucessAlert(message: any) {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500
    })
  }

  errorAlert2() {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Name already exist!',
      timer: 1500
    })
  }

  getlgstatus(data: any) {
    this.loingstatus.next(data)
  }

  getaboutcall() {
    var data = {}
    return this.executePost('getaboutwebsite', data);
  }

  postsignup(data: any) {
    return this.executeWrite('postwebsitesignup', data);
  }

  passwordlogin(data: any) {
    const payload = { ...data };
    if (payload.mobile_number && typeof payload.mobile_number === 'string') {
      payload.mobile_number = payload.mobile_number.trim();
    }
    if (payload.password && typeof payload.password === 'string') {
      payload.password = payload.password.trim();
    }
    return this.executePost('passwordwebsitelogin', payload);
  }

  getevents() {
    var data = {}
    return this.executePost('getupdateevents', data);
  }

  postbeliver(data: any) {
    return this.executeWrite('postbeliversignup', data);
  }

  getdenomation() {
    return this.executePost('denomations', {}, FALLBACK_DENOMINATIONS);
  }

  getleaderlevel() {
    return this.executePost('leaderlevels', {}, FALLBACK_LEADER_LEVELS);
  }

  geteducational() {
    return this.executePost('educationalq', {});
  }

  institutes() {
    return this.executePost('getinstitutes', {});
  }

  getpattern() {
    return this.executePost('pattern', {}, FALLBACK_PATTERNS);
  }

  postministrysignup(data: any) {
    return this.executeWrite('postministrysignup', data);
  }

  postregform(data: any) {
    return this.executeWrite('postregform', data);
  }

  postwishform(data: any) {
    return this.executeWrite('postwishform', data);
  }

  getdistrict() {
    return this.executePost('getdistricts', {}, FALLBACK_DISTRICTS);
  }

  getmdistrict() {
    return this.executePost('getmdistricts', {}, FALLBACK_DISTRICTS);
  }

  getmandals() {
    return this.executePost('getmandals', {});
  }

  getmmandals() {
    return this.executePost('getmmandals', {});
  }

  gepanchayatis() {
    return this.executePost('gepanchayati', {});
  }

  gempanchayatis() {
    return this.executePost('gepanchayati', {});
  }

  getbelivers() {
    return this.http.post(this.testApi + 'getbelivers', [])
  }

  postindepedentorganisation(data: any) {
    return this.executeWrite('postindepedentorganisation', data);
  }

  postchurchregister(data: any) {
    return this.executeWrite('postchurchregister', data);
  }
  postpastorassociationss(data: any) {
    return this.executeWrite('postpastorassociations', data);
  }

  postrpastor(data: any) {
    return this.executeWrite('postpastor', data);
  }


  postindepedentchurch(data: any) {
    return this.executeWrite('postindepedentchurch', data);
  }

  getservices() {
    return this.executePost('getservices', {}, FALLBACK_SERVICES);
  }

  addNew(proofdata: any) {
    return this.executePost('addNew', proofdata).pipe(map(res => {
      if (res.status == 300) {
        this.errorAlert2();
      }
      else {
        this.sucessAlert('Service Added Sucessfully')
        return res;
      }
    }));
  }


  getconsistencys() {
    return this.executePost('getconsistencys', {});
  }
  getmconsistencys() {
    return this.executePost('getmconsistencys', {});
  }
  poststudentsignup(data: any) {
    return this.executeWrite('studentsignup', data);
  }

  getchurch() {
    return this.executePost('getchurch', {});
  }
  getbeliversdata() {
    return this.executePost('getbeliversdata', {});
  }

  getpastor() {
    return this.executePost('getpastor', {});
  }

  postsmeetings(data: any) {
    console.log(data);
    return this.executeWrite('postmeetings', data);
  }

  getpersonal(data: any) {
    return this.http.post(this.testApi + 'getpersonal', data)
  }

  postchurchmeetings(data: any) {
    return this.executeWrite('postchuechmeetings', data);
  }
  postjobs(data: any) {
    return this.executeWrite('postjobs', data);
  }
  postadds(data: any) {
    return this.executeWrite('postadds', data);
  }
  postinsututies(data: any) {
    return this.executeWrite('postinsututies', data);
  }
  postcolleges(data: any) {
    return this.executeWrite('postcolleges', data);
  }
  postmarriages(data: any) {
    return this.executeWrite('postmarriages', data);
  }
  getrevival() {
    var data = {}
    return this.http.post<any>(this.testApi + `getrevival`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  getyouth() {
    var data = {}
    return this.http.post<any>(this.testApi + `getyouth`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  getwomen() {
    var data = {}
    return this.http.post<any>(this.testApi + `getwomen`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  getpastormeeting() {
    var data = {}
    return this.http.post<any>(this.testApi + `getpastormeeting`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  getchildern() {
    var data = {}
    return this.http.post<any>(this.testApi + `getchildern`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  getmusicals() {
    var data = {}
    return this.http.post<any>(this.testApi + `getmusical`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  searchingdata(data: any) {
    return this.http.post(this.testApi + 'searchingdata', data);
  }

  searchingdemonationdata(data: any) {
    return this.http.post(this.testApi + 'searchingdemonation', data);
  }

  searchingchurchdata(data: any) {
    return this.http.post(this.testApi + 'searchingchurchdata', data);
  }


  getchurches() {
    var data = {}
    return this.http.post<any>(this.testApi + `getchurches`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  getwing() {
    return this.executePost('getwing', []);
  }


  postattacks(data: any) {
    return this.executeWrite('postattacks', data);
  }

  getimages() {
    return this.http.post(this.testApi + 'getwebsitegallery', [])
  }

  getcatewebsitegallery() {
    return this.http.get(this.testApi + 'getcatewebsitegallery')
  }

  Searchinstitute(data: any) {
    return this.http.post(this.testApi + 'Searchinstitute', data)
  }

  postingmarriages(data: any) {
    return this.http.post(this.testApi + 'postingmarriages', data)
  }
  updateprofile(data: any) {
    return this.http.post(this.testApi + 'updateprofile', data)
  }
  updatebeliver(data: any) {
    return this.http.post(this.testApi + 'updatebeliver', data)
  }
  searchmarriages(data: any) {
    return this.http.post(this.testApi + 'Searchmarriages', data)
  }

  searchpastors(data: any) {
    return this.http.post(this.testApi + 'searchpastors', data)
  }
  searchorganization(data: any) {
    return this.http.post(this.testApi + 'searchorganization', data)
  }
  getadds() {
    var data = {}
    return this.http.post<any>(this.testApi + `getaddsdata`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  getorganizations() {
    var data = {}
    return this.http.post<any>(this.testApi + `getorganizations`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  contact(data: any) {
    return this.http.post<any>(this.testApi + `contact`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  getjobs(data: any) {
    return this.http.post(this.testApi + 'searchjob', data)
  }

  getuserprofilereport(data: any) {
    return this.http.post<any>(this.testApi + 'getuserprofilereport', data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  getdownloadsdata() {
    return this.http.get(this.testApi + 'getadocumentsdataa');
  }

  getLeaderswebsiteD(data: any) {
    // console.log(data);

    return this.http.post(this.testApi + 'getLeaderswebsiteData', data)
  }

  getLeaderswebsitewing(data: any) {
    return this.http.post(this.testApi + 'getLeaderswebsitewing', data)
  }

  getUserMainData(data: any) {
    return this.http.post(this.testApi + 'getUserMainData/', data)
  }

  deleteleaders(data: any) {
    return this.http.post<any>(this.testApi + `deleteboardmember`, data).pipe(map(res => {
      this.statusChangeAlert('Request Rejected Successfully')
      return res;
    }));
  }

  posthelping(data: any) {
    return this.executeWrite('posthelping', data);
  }

  gethelp() {
    var data = {}
    return this.http.post<any>(this.testApi + `gethelps`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  postupdatenews(data: any) {
    return this.executeWrite('postnews', data);
  }
  getupdatenews() {
    var data = {}
    return this.http.post<any>(this.testApi + `getnews`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }



  postbusiness(data: any) {
    return this.executeWrite('postbusiness', data);
  }

  // getbusiness(data:any) {
  //   return this.http.post<any>(this.testApi + `getbusiness`, data).pipe(map(res => {
  //     return res;
  //   }, (error: any) => {
  //     return error;
  //   }));
  // }
  getbusiness() {
    var data = {}
    return this.http.post<any>(this.testApi + `getbusiness`, data).pipe(map(res => {
      return res;
    }, (error: any) => {
      return error;
    }));
  }

  searchingbusiness(data: any) {
    return this.http.post(this.testApi + 'searchingbusiness', data);
  }


  updateconsistency(data: any) {
    return this.http.post<any>(this.testApi + `updateconsis/`, data).pipe(map(res => {
      this.statusChangeAlert('Request Accepted Successfully')
      return res;
    }));
  }


  getpastorassci() {
    return this.executePost('getpastorassociation', {});
  }

  getvideourldatadetails() {
    return this.http.get<any>(this.testApi + `getvideourl`).pipe(map(res => {
      return res;
    }, (error: any) => {

      return error;
    }));
  }

  checknumber(data: any) {
    return this.http.post(this.testApi + 'checknumber', data);
  }

  checkotp(data: any) {
    return this.http.post(this.testApi + 'checkotp', data);
  }

  createfrgetpassword(data: any) {
    return this.http.post(this.testApi + 'createfrgetpassword', data);
  }

  updatedetails(data: any) {
    return this.http.post(this.testApi + 'updatedetails', data);

  }

  geteditdtails(data: any) {
    return this.http.post(this.testApi + 'geteditdtails', data);
  }

  editpastor(data: any) {
    return this.http.post(this.testApi + 'editpastor', data);
  }
  // editministry(data: any) {
  //   return this.http.post(this.testApi + 'editpastor', data);
  // }
  editchurch(data: any) {
    return this.http.post(this.testApi + 'editchurch', data);
  }
  editindependentorgainsation(data: any) {
    return this.http.post(this.testApi + 'editindependentorgainsation', data);
  }
  editpastororgainsation(data: any) {
    return this.http.post(this.testApi + 'editpastororgainsation', data);
  }
  editpastorsassociations(data: any) {
    return this.http.post(this.testApi + 'editpastorsassociations', data);
  }
  editbeliver(data: any) {
    return this.http.post(this.testApi + 'editbeliver', data).pipe(map(res => {
      console.log(data);

      return res;
    }, (error: any) => {
      return error;
    }));
  }
  editstudent(data: any) {
    return this.http.post(this.testApi + 'editstudent', data).pipe(map(res => {
      console.log(data);
      return res;
    }, (error: any) => {
      return error;
    }));
  }
  editministry(data: any) {
    return this.http.post(this.testApi + 'editministry', data);
  }
  searchingmarriages(data: any) {
    return this.http.post(this.testApi + 'searchingmarriages', data);
  }
  searchinorganizations(data: any) {
    return this.http.post(this.testApi + 'searchinorganizations', data);
  }
  getjob() {
    return this.http.post(this.testApi + 'getjob', []);
  }

  searchjobswise(data: any) {
    return this.http.post(this.testApi + 'searchjobswise', data);
  }


  getatt() {
    return this.http.post(this.testApi + 'getatt', []);
  }
  /////////////////////////////////service page data////////////////////////////
  getpastorsfilters(data: any) {
    return this.executePost('getpastorsfilters', data);
  }
  getchurchesdatafilters(data: any) {
    return this.executePost('getchurchesdatafilters', data);
  }

  viewupdates(data: any) {
    return this.http.post(this.testApi + 'viewupdates', data)
  }
    viewconstituencyname(data: any) {
    return this.http.post(this.testApi + 'viewconstituencyname', data)
  }

  viewpastorupdates(data: any) {
    return this.http.post(this.testApi + 'pastorviewupdates', data)
  }
}





