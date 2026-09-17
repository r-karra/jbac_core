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

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  // Dynamically determines the appropriate API URL base
  get testApi(): string {
    return this.getBaseApiUrl();
  }

  getBaseApiUrl(): string {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
      // Running on HTTPS (e.g. AWS Amplify)
      // Browsers block direct http:// calls as Mixed Content.
      // Route via relative /dashboardapi/ so AWS Amplify's Reverse Proxy can forward to Elastic Beanstalk
      if (environment && environment.apiUrl && environment.apiUrl.startsWith('https:')) {
        return `${environment.apiUrl.replace(/\/+$/, '')}/dashboardapi/`;
      }
      return '/dashboardapi/';
    }
    // Running on HTTP (e.g. localhost dev)
    if (environment && environment.apiUrl) {
      return `${environment.apiUrl.replace(/\/+$/, '')}/dashboardapi/`;
    }
    return 'http://jbac-backend-env.eba-rdpqwigp.ap-southeast-2.elasticbeanstalk.com/dashboardapi/';
  }

  /**
   * Multi-tiered resilient API caller:
   * 1. Primary API: Amplify Reverse Proxy (/dashboardapi/) or Elastic Beanstalk
   * 2. Automatic Fallback: Live HTTPS endpoint (https://jbac.in:9762/dashboardapi/)
   * 3. Static Fallback: Pre-bundled datasets so dropdowns never fail or stay empty
   */
  executePost<T = any>(endpoint: string, body: any = {}, fallbackData?: any): Observable<T> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const primaryUrl = `${this.getBaseApiUrl()}${cleanEndpoint}`;
    const fallbackBase = (environment && (environment as any).fallbackApiUrl)
      ? (environment as any).fallbackApiUrl.replace(/\/+$/, '')
      : 'https://jbac.in:9762/dashboardapi';
    const fallbackUrl = `${fallbackBase}/${cleanEndpoint}`;

    return this.http.post<T>(primaryUrl, body).pipe(
      catchError((primaryErr) => {
        console.warn(`[ServiceService] Primary call to ${primaryUrl} failed. Retrying fallback ${fallbackUrl}:`, primaryErr);
        return this.http.post<T>(fallbackUrl, body).pipe(
          catchError((fallbackErr) => {
            console.error(`[ServiceService] Fallback call to ${fallbackUrl} failed:`, fallbackErr);
            if (fallbackData !== undefined) {
              return of({ status: 200, data: fallbackData } as any);
            }
            return throwError(() => fallbackErr);
          })
        );
      })
    );
  }

  executeGet<T = any>(endpoint: string, fallbackData?: any): Observable<T> {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const primaryUrl = `${this.getBaseApiUrl()}${cleanEndpoint}`;
    const fallbackBase = (environment && (environment as any).fallbackApiUrl)
      ? (environment as any).fallbackApiUrl.replace(/\/+$/, '')
      : 'https://jbac.in:9762/dashboardapi';
    const fallbackUrl = `${fallbackBase}/${cleanEndpoint}`;

    return this.http.get<T>(primaryUrl).pipe(
      catchError((primaryErr) => {
        console.warn(`[ServiceService] Primary GET to ${primaryUrl} failed. Retrying fallback ${fallbackUrl}:`, primaryErr);
        return this.http.get<T>(fallbackUrl).pipe(
          catchError((fallbackErr) => {
            console.error(`[ServiceService] Fallback GET to ${fallbackUrl} failed:`, fallbackErr);
            if (fallbackData !== undefined) {
              return of({ status: 200, data: fallbackData } as any);
            }
            return throwError(() => fallbackErr);
          })
        );
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
    return this.executePost('postwebsitesignup', data);
  }

  passwordlogin(data: any) {
    return this.executePost('passwordwebsitelogin', data);
  }

  getevents() {
    var data = {}
    return this.executePost('getupdateevents', data);
  }

  postbeliver(data: any) {
    return this.executePost('postbeliversignup', data);
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
    return this.executePost('postministrysignup', data);
  }

  postregform(data: any) {
    return this.executePost('postregform', data);
  }

  postwishform(data: any) {
    return this.executePost('postwishform', data);
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
    return this.http.post(this.testApi + 'postindepedentorganisation', data)
  }

  postchurchregister(data: any) {
    return this.http.post(this.testApi + 'postchurchregister', data)
  }
  postpastorassociationss(data: any) {
    return this.http.post(this.testApi + 'postpastorassociations', data)
  }

  postrpastor(data: any) {
    return this.http.post(this.testApi + 'postpastor', data)
  }


  postindepedentchurch(data: any) {
    return this.http.post(this.testApi + 'postindepedentchurch', data)
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
    return this.executePost('studentsignup', data);
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
    return this.http.post(this.testApi + 'postmeetings', data)
  }

  getpersonal(data: any) {
    return this.http.post(this.testApi + 'getpersonal', data)
  }

  postchurchmeetings(data: any) {
    return this.http.post(this.testApi + 'postchuechmeetings', data);
  }
  postjobs(data: any) {
    return this.http.post(this.testApi + 'postjobs', data);
  }
  postadds(data: any) {
    return this.http.post(this.testApi + 'postadds', data);
  }
  postinsututies(data: any) {
    return this.http.post(this.testApi + 'postinsututies', data);
  }
  postcolleges(data: any) {
    return this.http.post(this.testApi + 'postcolleges', data);
  }
  postmarriages(data: any) {
    return this.http.post(this.testApi + 'postmarriages', data);
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
    return this.http.post<any>(this.testApi + 'postattacks', data);
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
    return this.http.post(this.testApi + 'posthelping', data)
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
    return this.http.post(this.testApi + 'postnews', data)
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
    return this.http.post(this.testApi + 'postbusiness', data);
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





