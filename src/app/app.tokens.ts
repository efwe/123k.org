import {InjectionToken} from '@angular/core';
import {LatLng, LatLngExpression} from 'leaflet';

export const API_URL = new InjectionToken<string>('API_URL');
export const INITIAL_CENTER = new InjectionToken<LatLngExpression>('INITIAL_CENTER', {
  factory: () => [49.29,11.07]
});
export const GEOHASH_CENTERS = new InjectionToken<LatLngExpression[]>('GEOHASH_CENTERS', {
  factory: () => [new LatLng(50.799461, 20.465209), new LatLng(49.310417, 11.024885)]
});
