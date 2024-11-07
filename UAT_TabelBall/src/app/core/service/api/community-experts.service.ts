import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunityExpertsService {
  private apiUrl = 'http://127.0.0.1:5000/api/community_expert';

  constructor(private http: HttpClient) {}

  getAllExperts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addExpert(expertData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, expertData);
  }

  updateExpert(id: number, expertData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, expertData);
  }

  deleteExpert(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
