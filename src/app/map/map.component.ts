import {AfterViewInit, ChangeDetectionStrategy, Component, inject, input, OnDestroy, output} from '@angular/core';
import {LatLngBounds, LatLngExpression, Map, TileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {INITIAL_CENTER} from '../app.tokens';


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

  center = input<LatLngExpression>(inject(INITIAL_CENTER));
  boundsChange = output<LatLngBounds>();

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

    this.map.on('moveend', () => {
      this.boundsChange.emit(this.map!.getBounds());
    });

    // Initial emit
    this.boundsChange.emit(this.map.getBounds());
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
