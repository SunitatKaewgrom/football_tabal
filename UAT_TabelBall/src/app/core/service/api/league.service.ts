import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  private apiUrl = 'http://127.0.0.1:5000/api/leagues';

  constructor(private http: HttpClient) {}

  // ดึงข้อมูลลีกทั้งหมด
  getLeagues(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ดึงข้อมูลลีกตาม ID
  getLeagueById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ฟังก์ชันสร้างลีกใหม่โดยใช้ FormData
  createLeague(name: string, logoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo_file', logoFile);

    return this.http.post<any>(this.apiUrl, formData);
  }

  // อัปเดตข้อมูลลีก
  updateLeague(id: number, name: string, logoFile?: File): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (logoFile) {
      formData.append('logo_file', logoFile);
    }

    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // ลบลีกตาม ID
  deleteLeague(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
