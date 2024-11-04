// src/app/core/service/api/team.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://127.0.0.1:5000/api/teams'; // URL ของ API สำหรับจัดการทีม
  private leagueApiUrl = 'http://127.0.0.1:5000/api/leagues'; // URL ของ API สำหรับดึงข้อมูลลีก

  constructor(private http: HttpClient) {}

  // ฟังก์ชันดึงข้อมูลทีมทั้งหมด
  getTeams(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ฟังก์ชันดึงข้อมูลลีกทั้งหมด
  getLeagues(): Observable<any> {
    return this.http.get<any>(this.leagueApiUrl);
  }

  // ฟังก์ชันสร้างทีมใหม่
  createTeam(name: string, leagueId: number, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('league_id', leagueId.toString());
    if (logoFile) {
      formData.append('logo_file', logoFile);
    }
    return this.http.post<any>(this.apiUrl, formData);
  }

  // ฟังก์ชันอัปเดตข้อมูลทีม
  updateTeam(id: number, name: string, leagueId: number, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('league_id', leagueId.toString());
    if (logoFile) {
      formData.append('logo_file', logoFile);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // ฟังก์ชันลบทีมตาม ID
  deleteTeam(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
