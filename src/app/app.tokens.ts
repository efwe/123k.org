import {InjectionToken} from '@angular/core';
import {LatLngExpression} from 'leaflet';

export const API_URL = new InjectionToken<string>('API_URL');
export const INITIAL_CENTER = new InjectionToken<LatLngExpression>('INITIAL_CENTER', {
  factory: () => [50.8, 20.5]
});
