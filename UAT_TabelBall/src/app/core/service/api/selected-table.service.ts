import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SelectedTableService {
  private leaguesCache = new BehaviorSubject<any[]>([]);
  private teamsCache = new BehaviorSubject<any[]>([]);
  private expertsCache = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  // โหลดข้อมูล Leagues
  getLeagues(): Observable<any[]> {
    if (this.leaguesCache.value.length === 0) {
      return this.http.get<any[]>('http://127.0.0.1:5000/api/leagues').pipe(
        tap((data) => this.leaguesCache.next(data))
      );
    }
    return this.leaguesCache.asObservable();
  }

  // โหลดข้อมูล Teams
  getTeams(): Observable<any[]> {
    if (this.teamsCache.value.length === 0) {
      return this.http.get<any[]>('http://127.0.0.1:5000/api/teams').pipe(
        tap((data) => this.teamsCache.next(data))
      );
    }
    return this.teamsCache.asObservable();
  }

  // โหลดข้อมูล Experts
  getExperts(): Observable<any[]> {
    if (this.expertsCache.value.length === 0) {
      return this.http.get<any[]>('http://127.0.0.1:5000/api/experts').pipe(
        tap((data) => this.expertsCache.next(data))
      );
    }
    return this.expertsCache.asObservable();
  }

  // โหลดข้อมูล Selected Items
  getSelectedItems(): Observable<any[]> {
    return this.http.get<any[]>('http://127.0.0.1:5000/api/selected-items');
  }

  // บันทึกข้อมูล Selected Item
  saveSelectedItem(data: any): Observable<any> {
    if (data.id) {
      // ถ้ามี id ให้ใช้ PUT เพื่ออัปเดต
      return this.http.put<any>(`http://127.0.0.1:5000/api/selected-items/${data.id}`, data);
    } else {
      // ถ้าไม่มี id ให้ใช้ POST เพื่อสร้างข้อมูลใหม่
      return this.http.post<any>('http://127.0.0.1:5000/api/selected-items', data);
    }
  }
  

  // ลบ Selected Item
  deleteSelectedItem(id: number): Observable<any> {
    return this.http.delete<any>(`http://127.0.0.1:5000/api/selected-items/${id}`);
  }
  
}
