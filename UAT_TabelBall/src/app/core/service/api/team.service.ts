// src/app/core/service/api/team.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://127.0.0.1:5000/api/teams';
  private leagueApiUrl = 'http://127.0.0.1:5000/api/leagues';

  constructor(private http: HttpClient) {}

  // ดึงข้อมูลทีมทั้งหมด
  getTeams(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ดึงข้อมูลลีกทั้งหมด
  getLeagues(): Observable<any> {
    return this.http.get<any>(this.leagueApiUrl);
  }

  // สร้างทีมใหม่โดยใช้ FormData
  createTeam(name: string, leagueId: number, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('leagueId', leagueId.toString());
    if (logoFile) formData.append('logoFile', logoFile);

    return this.http.post<any>(this.apiUrl, formData);
  }

  // อัปเดตข้อมูลทีมโดยใช้ FormData
  updateTeam(id: number, name: string, leagueId: number, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('leagueId', leagueId.toString());
    if (logoFile) formData.append('logoFile', logoFile);

    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // ลบทีม
  deleteTeam(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
