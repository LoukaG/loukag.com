import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

  sendEmail(emailData: any) {
    fetch(environment.emailUrl, {
      method: "POST",
      body: JSON.stringify(emailData),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });


  }
}