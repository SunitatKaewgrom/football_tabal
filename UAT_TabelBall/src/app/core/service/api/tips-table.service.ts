import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root', // ทำให้ Service นี้สามารถใช้งานได้ทั่วทั้งแอป
})
export class TipsTableService {
  private baseUrl = 'http://127.0.0.1:5000/api'; // URL พื้นฐานของ API

  constructor(private http: HttpClient) {} // ใช้ HttpClient สำหรับเรียก API

  // ฟังก์ชันสำหรับดึงข้อมูลทีมทั้งหมดจาก API
  getTeams(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/teams`); // เรียก API ที่ endpoint `/teams`
  }

  // ฟังก์ชันสำหรับดึงข้อมูลลีกทั้งหมดจาก API
  getLeagues(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/leagues`); // เรียก API ที่ endpoint `/leagues`
  }

  // ฟังก์ชันสำหรับดึงข้อมูลเซียนบอลทั้งหมดจาก API
  getExperts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/experts`); // เรียก API ที่ endpoint `/experts`
  }

  // ฟังก์ชันสำหรับดึงข้อมูลทั้งหมด (ทีม, ลีก, เซียนบอล) รวมกัน
  getAllData(): Observable<any> {
    // ใช้ forkJoin รวม API หลายตัวเข้าด้วยกัน
    return forkJoin({
      teams: this.getTeams(), // ดึงข้อมูลทีม
      leagues: this.getLeagues(), // ดึงข้อมูลลีก
      experts: this.getExperts(), // ดึงข้อมูลเซียนบอล
    });
  }

  // ฟังก์ชันสำหรับบันทึกข้อมูลการทายผลไปยัง API
  addTipsPrediction(tipsData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/matches`, tipsData); // ส่งข้อมูลแบบ POST ไปที่ `/tips`
  }
}
