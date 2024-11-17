import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root', // ทำให้ Service นี้สามารถใช้งานได้ทั่วทั้งแอป
})
export class TipsTableService {
  private baseUrl = 'http://127.0.0.1:5000/api'; // URL พื้นฐานของ API

  constructor(private http: HttpClient) {} // ใช้ HttpClient สำหรับเรียก API

  // ดึงข้อมูลทีมทั้งหมดจาก API
  getTeams(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/teams`); // เรียก API ที่ endpoint `/teams`
  }

  // ดึงข้อมูลลีกทั้งหมดจาก API
  getLeagues(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/leagues`); // เรียก API ที่ endpoint `/leagues`
  }

  // ดึงข้อมูลเซียนบอลทั้งหมดจาก API
  getExperts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/experts`); // เรียก API ที่ endpoint `/experts`
  }

  // ดึงข้อมูลคู่บอล 5 คู่ล่าสุดจาก API
  getTop5Matches(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/matches?limit=5`); // กำหนดให้แสดง 5 คู่แรก
  }

  getMatches(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/matches`);
  }

  // บันทึกข้อมูล matches พร้อม predictions ไปยัง API
  addMatchesWithPredictions(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/matches`, data); // เปลี่ยน endpoint เป็น /api/matches
  }
  
  updateMatch(matchId: number, matchData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/matches/${matchId}`, matchData);
  }

  updatePrediction(predictionId: number, predictionData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/predictions/${predictionId}`, predictionData);
  }

  deleteMatch(matchId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/matches/${matchId}`);
  }

  deletePrediction(predictionId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/predictions/${predictionId}`);
  }

  // ดึงข้อมูลทั้งหมด (ทีม, ลีก, เซียนบอล) รวมกัน
  getAllData(): Observable<any> {
    return forkJoin({
      teams: this.getTeams(), // ดึงข้อมูลทีม
      leagues: this.getLeagues(), // ดึงข้อมูลลีก
      experts: this.getExperts(), // ดึงข้อมูลเซียนบอล
    });
  }
}
