import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/login';  // URL ของ API

  constructor(private http: HttpClient) {
    console.log('HttpClient injected in AuthService:', http);
  } 

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { username, password });
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') { 
      return !!localStorage.getItem('token');
    }
    return false;
  }

  logout() {
    localStorage.removeItem('token');
  }
}
