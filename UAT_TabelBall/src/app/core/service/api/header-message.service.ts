import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderMessageService {
  private apiUrl = 'http://localhost:5000/api/header-message';  // URL ของ API

  constructor(private http: HttpClient) {}

  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);  // ดึงข้อมูลข้อความทั้งหมดจาก backend
  }

  addMessage(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);  // ส่งข้อมูล form data ไปยัง backend
  }
}
