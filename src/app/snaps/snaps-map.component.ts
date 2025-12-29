import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  viewChild
} from '@angular/core';
import {Icon, LatLngBounds, LatLngExpression, LayerGroup, Map, Marker} from 'leaflet';
import {MapComponent} from '../map/map.component';
import {Snap} from './snap.model';
import {INITIAL_CENTER} from '../app.tokens';

@Component({
  selector: 'app-snaps-map',
  imports: [MapComponent],
  template: `
    <app-map [center]="center()" (boundsChange)="boundsChange.emit($event)" />
  `,
  styles: [`
    :host
      display: block
      height: 100%
      width: 100%
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapsMapComponent implements OnDestroy {
  mapComponent = viewChild.required(MapComponent);
  center = input<LatLngExpression>(inject(INITIAL_CENTER));
  snaps = input<Snap[]>([]);
  boundsChange = output<LatLngBounds>();

  private markersLayer?: LayerGroup;

  constructor() {
    effect(() => {
      const map = this.mapComponent().leafletMap();
      const snaps = this.snaps();

      if (map) {
        this.renderMarkers(map, snaps);
      }
    });
  }

  private renderMarkers(map: Map, snaps: Snap[]): void {
    if (!this.markersLayer) {
      this.markersLayer = new LayerGroup().addTo(map);
    }

    this.markersLayer.clearLayers();

    for (const snap of snaps) {
      const marker = new Marker(snap.location, {
        icon: new Icon({iconUrl: 'assets/leaflet/marker-icon.png'})
      });
      marker.bindPopup(`
        <img src="${snap.thumbNailUrl}" alt="${snap.title}" width="${snap.thumbNailWidth}" height="${snap.thumbNailHeight}" style="display: block; margin: 0 auto;">
      `);
      marker.addTo(this.markersLayer);
    }
  }

  ngOnDestroy(): void {
    if (this.markersLayer) {
      this.markersLayer.remove();
    }
  }
}
