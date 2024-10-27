import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderMessageService {
  private apiUrl = 'http://localhost:5000/api/header-message';

  constructor(private http: HttpClient) {}

  getMessages(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addMessage(payload: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
