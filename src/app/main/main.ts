import {Component, ChangeDetectionStrategy, signal, inject, computed} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {MapComponent} from '../map/map.component';
import {SnapsComponent} from '../snaps/snaps.component';
import {LatLngBounds, LatLng, latLng} from 'leaflet';
import {INITIAL_CENTER} from '../app.tokens';

@Component({
  selector: 'app-main',
  imports: [MatGridListModule, MapComponent, SnapsComponent],
  templateUrl: './main.html',
  styleUrl: './main.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {

  box = signal<LatLngBounds>((() => {
    const center = latLng(inject(INITIAL_CENTER));
    const latOffset = 0.225;
    const lngOffset = 0.225;
    const southWest = new LatLng(center.lat - latOffset, center.lng - lngOffset);
    const northEast = new LatLng(center.lat + latOffset, center.lng + lngOffset);
    return new LatLngBounds(southWest, northEast);
  })());

  onBoundsChange(bounds: LatLngBounds) {
    this.box.set(bounds);
  }
}
