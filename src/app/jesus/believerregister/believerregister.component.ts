import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from '../service.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-believerregister',
  templateUrl: './believerregister.component.html',
  styleUrls: ['./believerregister.component.css']
})
export class BelieverregisterComponent {
  showSpinner: boolean = false;
  extension: boolean = false;
  submitted: boolean = false;
  form_ind: any;
  beliverform: FormGroup;
  denomation: any;
  pattern: any;
  districts: any;
  mandals: any;
  panchayati: any;
  bliversdata: any;
  district: any;
  constituency: any;
  panchayatis: any;
  imagedata: any = []
  wings: any;
  now: any;
  ministryname: any;
  constituency_id: any;
  services: any;
  id: any
  constructor(private formBuilder: FormBuilder, private service: ServiceService, private router: Router, private modalService: NgbModal) {
    this.beliverform = this.formBuilder.group({
      fname: ['', [Validators.required]],
      whatsapp: [''],
      // testwhatsapp: [''],
      dob: [''],
      gender: ['', [Validators.required]],
      email: [''],
      mobile_number: ['', [Validators.required, Validators.maxLength(10)]],
      status: ['', [Validators.required]],
      income: [''],
      caste: [''],
      subcaste: [''],
      nativeplace: [''],
      talent: ['', [Validators.required]],
      education: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      dpartment: ['', [Validators.required]],
      districts: ['', [Validators.required]],
      mandals: ['', [Validators.required]],
      panchayati: ['', [Validators.required]],
      constituencyname: ['', [Validators.required]],
      villagename: ['', [Validators.required]],
      wardnumber: [''],
      ward: ['', [Validators.required]],
      nri: ['', [Validators.required]],
      leadership: ['', [Validators.required]],
      leadertype: [''],
      generaltype: [''],
      subward: [''],
      wingtype: [''],
      wingtypes: [''],
      denomination_id: ['', [Validators.required]],
      hobbies: [''],
      spirti: [''],
      lifegoal: [''],
      church: [''],
      pastor: [''],
      youtube: [''],
      lname: [''],
      god: [''],
      // // term: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      retypepassword: ['', [Validators.required, Validators.minLength(6)]],
    })
  }
  get h() { return this.beliverform.controls; }
  name: any;
  usr_id: any;
  constituencyname: any;
  logincon: boolean = false
  ngOnInit(): void {
    this.getdistric();
    this.getdenomations();
    const datePipe = new DatePipe('en-Us');
    this.now = datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.usr_id = sessionStorage.getItem('usr_id');
    this.name = sessionStorage.getItem('name');
    if (this.usr_id) {
      this.logincon = true;
    } else {
      this.logincon = false;
    }
  }

  get be(): { [key: string]: AbstractControl } {
    return this.beliverform.controls;
  }

  formshow(id: any) {
    this.form_ind = id
    this.beliverform.reset();
    this.lead = false;
    this.mini = false;
    this.assicoation = false;
    this.leadtype = false;
    this.wingtype = false;
    this.wingtypes = false;
    this.subward = false;
    this.father = false;
  }
  getdistric() {
    this.service.getdistrict().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.districts = Array.isArray(list) ? list : [];
      },
      error: (err) => {
        console.error('Failed to load districts:', err);
        this.districts = [];
      }
    });
  }

  getmandals(event: any) {
    const id = event?.target?.value;
    if (!id) return;
    this.service.getmandals().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.mandals = Array.isArray(list) ? list.filter((data: any) => data.const_id == id) : [];
      },
      error: (err) => {
        console.error('Failed to load mandals:', err);
        this.mandals = [];
      }
    });
  }

  getdenomations() {
    this.service.getdenomation().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.denomation = Array.isArray(list) ? list : [];
      },
      error: (err) => {
        console.error('Failed to load denominations:', err);
        this.denomation = [];
      }
    });
  }

  getconstency(event: any) {
    const id = event?.target?.value;
    if (!id) return;
    this.service.getconsistencys().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.constituency = Array.isArray(list) ? list.filter((data: any) => data.dstrct_id == id) : [];
      },
      error: (err) => {
        console.error('Failed to load constituencies:', err);
        this.constituency = [];
      }
    });
  }

  gepanchayati(event: any) {
    const id = event?.target?.value;
    if (!id) return;
    this.service.gepanchayatis().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.panchayati = Array.isArray(list) ? list.filter((data: any) => data.mndl_id == id) : [];
      },
      error: (err) => {
        console.error('Failed to load panchayati:', err);
        this.panchayati = [];
      }
    });
  }
  getpastorsdatas: any;

  getpastorsdata() {
    if (this.beliverform.value.districts == null || this.beliverform.value.constituencyname == null || this.beliverform.value.mandals == null) {
      alert("Please Fill the Districts, Constituency & Mandal")
    } else {
      var data = {
        districts: this.beliverform.value.districts,
        constituencyname: this.beliverform.value.constituencyname,
        mandal_id: this.beliverform.value.mandals,
      }
      console.log(data);

      this.service.getpastorsfilters(data).subscribe((res: any) => {
        this.getpastorsdatas = res.data;
      })
    }
  }
  getchurchfilter: any;
  getchurchesdata() {
    if (this.beliverform.value.districts == null || this.beliverform.value.constituencyname == null || this.beliverform.value.mandals == null) {
      alert("Please Fill the Districts, Constituency & Mandal")
    } else {
      var data = {
        districts: this.beliverform.value.districts,
        constituencyname: this.beliverform.value.constituencyname,
        mandal_id: this.beliverform.value.mandals,
      }
      console.log(data);

      this.service.getchurchesdatafilters(data).subscribe((res: any) => {
        this.getchurchfilter = res.data;
      })
    }
  }
  postbeliversignup() {
    this.submitted = true;
    const formValue = this.beliverform.value;
    const pwd = (formValue.password || '').trim();
    const repwd = (formValue.retypepassword || '').trim();
    if (this.beliverform.invalid) {
      Swal.fire('దయచేసి అన్ని వివరాలు నమోదు చేయండి');
      this.submitted = false;
    } else if (pwd !== repwd) {
      Swal.fire("Passwords are Unmatched");
      this.submitted = false;
    } else {
      this.service.postbeliver({ ...formValue, password: pwd, retypepassword: repwd }).subscribe(
        (res: any) => {
          this.submitted = false;
          if (res.status == 451) {
            Swal.fire('ఇదే ఫోన్ నెంబర్ తో ఇంతకుముందే రిజిస్టర్ అయ్యారు');
          } else if (res.status == 200) {
            Swal.fire('విజయవంతముగా నమోదు చేయబడింది, మీ ఫోన్ నెంబర్ మరియు పాస్వర్డ్ తో లాగిన్ అవగలరు');
            this.beliverform.reset();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'నమోదు విఫలమైంది',
              text: res.message || 'సర్వర్ డౌన్ వుంది, దయచేసి తరువాత ప్రయత్నించండి'
            });
          }
        },
        error => {
          this.submitted = false;
          console.error('[BelieverRegister] Error:', error);
          const isMixedContent = error?.status === 0;
          const msg = isMixedContent
            ? 'సర్వర్ కనెక్షన్ బ్లాక్ చేయబడింది (HTTPS/HTTP Mixed Content). దయచేసి బ్యాకెండ్‌ను క్లౌడ్‌ఫ్రంట్ (HTTPS) ద్వారా అనుసంధానించండి.'
            : (error?.error?.error || error?.message || 'సర్వర్ డౌన్ వుంది, దయచేసి తరువాత ప్రయత్నించండి');
          Swal.fire({
            icon: 'error',
            title: 'కనెక్షన్ లోపం',
            text: msg
          });
        }
      );
    }
  }
  church: any;
  pastor: any;
  getchurch() {
    this.service.getchurch().subscribe(res => {
      if (res.status == 202) {
        Swal.fire(res.message);
      } else if (res.status == 200) {
        this.church = res.data;
      }
    }, error => {

    })
  }
  lead: boolean = false;
  mini: boolean = false;
  assicoation: boolean = false;
  leadtype: boolean = false;
  wingtype: boolean = false;
  wingtypes: boolean = false;
  subward: boolean = false;
  father: boolean = false;
  onradiochange(event: any) {
    var a = event.value
    if (a == 'YES') {
      this.beliverform.patchValue({
        leadertype: '',
      });
      this.lead = true
    }

    if (a == 'NO') {
      this.beliverform.patchValue({
        leadertype: '',
      });
      this.lead = false
      this.leadtype = false
      this.wingtype = false
      this.wingtypes = false
      this.subward = false
    }
  }
  onsubward(event: any) {
    var s = event.target.value
    if (s == '6') {
      this.subward = true
    } else {
      this.subward = false
    }

  }
  onradioleadertype(event: any) {
    var a = event.value
    if (a == '1') {
      this.leadtype = true
      this.wingtype = false
      this.wingtypes = false
      this.subward = true
    } else {
      this.leadtype = false
      this.wingtype = true
      this.wingtypes = true
      this.subward = false
    }
  }
  // Accept Input As a Number Only
  numericOnly(event: any): boolean {
    let patt = /^([0-9])$/;
    let result = patt.test(event.key);
    return result;
  }
  modalDismiss() {
    this.modalService.dismissAll()
  }
  elem: any
  scroll() {
    this.elem = document.getElementById("ele");
    this.elem.scrollIntoView();
  }

  ///////////////////mobile view///////////////
  login: boolean = true;
  notlogin: boolean = false;

  ngAfterContentInit() {
    this.service.getloginstatus.subscribe((res: any) => {
      if (res == '1') {
        console.log('tru')
        this.login = false;
        this.notlogin = true;
        this.name = sessionStorage.getItem('name');
      } else if (res == '2') {
        console.log('false')
        this.login = true;
        this.notlogin = false;
      }
    })
  }

  checklogin() {
    if ((sessionStorage.getItem('usr_id')) == null) {
      this.login = true;
    } else {
      this.login = false;
      this.notlogin = true;
      this.name = sessionStorage.getItem('name');
    }
  }

  logout() {
    Swal.fire({
      title: 'Are you sure ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Logout Sucessfully')
        sessionStorage.clear();
        this.router.navigate(['/gallery']);
        this.service.getlgstatus('2')
      }
    })
  }


  alert() {
    Swal.fire('Hey user!', 'please Login', 'info');
    this.router.navigate(['/login']);
  }
}





