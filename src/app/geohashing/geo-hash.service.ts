import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {API_URL} from '../app.tokens';
import {GeoHash} from './geo-hash.model';
import {Location} from './location.model';
import {Forecast} from './forecast.model';

@Injectable({
  providedIn: 'root',
})
export class GeoHashService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);

  getGeoHash(lat: number, lng: number, date: string): Observable<GeoHash> {
    return this.http.get<GeoHash>(`${this.apiUrl}/geohash/${lat}/${lng}/${date}`);
  }

  getForecast(): Observable<Forecast[]> {
    return this.http.get<Forecast[]>(`${this.apiUrl}/geohash/forecast`);
  }

  getGlobalHash(): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/geohash/global`);
  }

}
