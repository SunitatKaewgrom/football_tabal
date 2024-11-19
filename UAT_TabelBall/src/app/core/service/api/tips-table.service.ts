import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface PredictionData {
  id?: number | null; // รองรับทั้ง undefined และ null
  expert_id: number;
  analysis: string;
  link: string;
  prediction: string;
}


@Injectable({
  providedIn: 'root',
})
export class TipsTableService {
  private baseUrl = 'http://127.0.0.1:5000/api'; // Base API URL

  constructor(private http: HttpClient) {}

  /**
   * ดึงข้อมูล Matches
   * @param limit จำนวน Matches ที่ต้องการ (Optional)
   */
  getMatches(limit: number = 5): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/matches?limit=${limit}`);
  }

  /**
   * เพิ่ม Matches พร้อม Predictions
   * @param data ข้อมูล Matches และ Predictions
   */
  addMatchesWithPredictions(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/matches`, data);
  }

  /**
   * อัปเดต Match
   * @param matchId รหัส Match
   * @param matchData ข้อมูลที่ต้องการอัปเดต
   */
  updateMatch(matchId: number, matchData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/matches/${matchId}`, matchData);
  }

  /**
   * ลบ Match
   * @param matchId รหัส Match ที่ต้องการลบ
   */
  deleteMatch(matchId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/matches/${matchId}`);
  }

  /**
   * อัปเดต Prediction
   * @param predictionId รหัส Prediction
   * @param predictionData ข้อมูลที่ต้องการอัปเดต
   */
  updatePrediction(predictionId: number, predictionData: PredictionData): Observable<any> {
    console.log(`Updating prediction with id ${predictionId}:`, predictionData); // Log ข้อมูลการอัปเดต
    return this.http.put<any>(`${this.baseUrl}/predictions/${predictionId}`, predictionData);
  }

  /**
   * ลบ Prediction
   * @param predictionId รหัส Prediction ที่ต้องการลบ
   */
  deletePrediction(predictionId: number): Observable<any> {
    console.log(`Deleting prediction with id: ${predictionId}`); // Log คำขอก่อนส่ง
    return this.http.delete<any>(`${this.baseUrl}/predictions/${predictionId}`);
  }

  /**
   * ดึงข้อมูล Teams
   */
  getAllTeams(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/teams`);
  }

  /**
   * ดึงข้อมูล Leagues
   */
  getAllLeagues(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/leagues`);
  }

  /**
   * ดึงข้อมูล Experts
   */
  getAllExperts(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/experts`);
  }

  /**
   * ดึงข้อมูลทั้งหมด (Teams, Leagues, Experts)
   */
  getAllData(): Observable<any> {
    return forkJoin({
      teams: this.getAllTeams(),
      leagues: this.getAllLeagues(),
      experts: this.getAllExperts(),
    });
  }

  /**
   * เพิ่ม Prediction ใหม่
   * @param matchId รหัส Match ที่ต้องการเพิ่ม Prediction
   * @param predictionData ข้อมูล Prediction ที่ต้องการเพิ่ม
   */
  addPrediction(matchId: number, predictionData: PredictionData): Observable<any> {
    console.log('Adding prediction:', { matchId, predictionData }); // Log ข้อมูลที่ส่งไป
    return this.http.post<any>(`${this.baseUrl}/predictions`, {
      match_id: matchId,
      ...predictionData,
    });
  }
}
