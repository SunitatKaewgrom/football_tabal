import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TipsTableService {
  private apiUrl = 'http://127.0.0.1:5000/api';
  private cachedData: any = null;

  constructor(private http: HttpClient) {}

  getAllExperts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/experts`).pipe(shareReplay(1));
  }

  getAllLeagues(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leagues`).pipe(shareReplay(1));
  }

  getAllTeams(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/teams`).pipe(shareReplay(1));
  }

  // Combined function to get all data at once and cache it
  getInitialData(): Observable<any> {
    if (this.cachedData) {
      return of(this.cachedData); // return cached data if available
    } else {
      return forkJoin({
        experts: this.getAllExperts(),
        leagues: this.getAllLeagues(),
        teams: this.getAllTeams()
      }).pipe(
        catchError((error) => {
          console.error('Error loading initial data:', error);
          return of({ experts: [], leagues: [], teams: [] });
        }),
        shareReplay(1) // share and cache the response
      );
    }
  }

  addTipsPrediction(tipsData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tips`, tipsData);
  }
}
