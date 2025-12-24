import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { API_URL } from '../app.tokens';
import {LatLngBounds} from 'leaflet';
import { Snap } from './snap.model';

@Injectable({
  providedIn: 'root',
})
export class SnapsService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);


  getSnaps(box: LatLngBounds): Observable<Snap[]> {
    const params = new HttpParams()
      .set('bbox', `${box.getWest()},${box.getSouth()},${box.getEast()},${box.getNorth()}`);
    return this.http.get<Snap[]>(`${this.apiUrl}/snaps`, { params });
  }
}
