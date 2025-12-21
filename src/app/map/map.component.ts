import {AfterViewInit, ChangeDetectionStrategy, Component, input, OnDestroy} from '@angular/core';
import {LatLng, Map, TileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy, AfterViewInit {
  private map?: Map;
  center = input<[number, number]>([0, 0]);

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private initMap(): void {
    const [lat, lng] = this.center();
    this.map = new Map('map').setView([lat, lng], 12);

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.map.invalidateSize();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
