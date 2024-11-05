// src/app/core/service/api/expert.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private apiUrl = 'http://127.0.0.1:5000/api/experts';

  constructor(private http: HttpClient) {}

  // ฟังก์ชันดึงข้อมูลเซียนบอลทั้งหมด
  getExperts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ฟังก์ชันดึงข้อมูลเซียนบอลตาม ID
  getExpertById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ฟังก์ชันเพิ่มเซียนบอลใหม่พร้อมรูปภาพ
  createExpert(name: string, imageFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('file', imageFile);
    }
    return this.http.post<any>(this.apiUrl, formData);
  }

  // ฟังก์ชันแก้ไขเซียนบอล
  updateExpert(id: number, name: string, imageFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('file', imageFile);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // ฟังก์ชันลบเซียนบอลตาม ID
  deleteExpert(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
