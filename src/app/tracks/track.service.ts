import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.tokens';
import { Track } from './track.model';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);

  findAll(): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.apiUrl}/tracks`);
  }

  getTrack(id: string): Observable<Track> {
    return this.http.get<Track>(`${this.apiUrl}/tracks/${id}`);
  }
}
