import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  output
} from '@angular/core';
import {LatLngBounds, LatLngExpression, LayerGroup, Map, Marker, TileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {INITIAL_CENTER} from '../app.tokens';
import {Snap} from '../snaps/snap.model';


@Component({
  selector: 'app-map',
  imports: [],
  template: `
    <div id="map"></div>
  `,
  styles: [`
    :host
      display: block
      height: 100%
      width: 100%

    #map
      height: 100%
      width: 100%
      min-height: 800px
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy, AfterViewInit {
  private map?: Map;
  private markersLayer?: LayerGroup;

  center = input<LatLngExpression>(inject(INITIAL_CENTER));
  snaps = input<Snap[]>([]);
  boundsChange = output<LatLngBounds>();

  constructor() {
    // Leaflet has imperative API - effects are OK here
    effect(() => {
      this.renderMarkers(this.snaps());
    });
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private initMap(): void {
    this.map = new Map('map').setView(this.center(), 13);

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.markersLayer = new LayerGroup().addTo(this.map);

    this.map.on('moveend', () => {
      this.boundsChange.emit(this.map!.getBounds());
    });

    // Initial
    this.boundsChange.emit(this.map.getBounds());
  }

  private renderMarkers(snaps: Snap[]): void {
    if (!this.markersLayer || !this.map) {
      return;
    }

    // clear previous markers
    this.markersLayer.clearLayers();

    if (snaps.length === 0) {
      return;
    }

    for (const snap of snaps) {
      const marker = new Marker(snap.location);
      marker.bindPopup(`
        <img src="${snap.thumbNailUrl}" alt="${snap.title}" width="${snap.thumbNailWidth}" height="${snap.thumbNailHeight}" style="display: block; margin: 0 auto;">
      `);
      marker.addTo(this.markersLayer);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    if(this.markersLayer) {
      this.markersLayer.remove()
    }
  }
}
