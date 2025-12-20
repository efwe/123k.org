import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {Map, TileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-map',
  imports: [MatGridListModule],
  template: `
    <div class="map-layout">
      <div class="map-panel" id="map"></div>

      <div class="picture-panel">
        <!-- right column  -->
      </div>
    </div>
  `,
  styles: [`
    :host
      display: block
      height: calc(100dvh - 64px)

    .map-layout
      display: grid
      height: calc(100dvh - 64px)

    /* Large / medium: map left, pictures right */
    @media (min-width: 960px)
      .map-layout
        grid-template-columns: 4fr 1fr
        grid-template-rows: auto
        grid-template-areas: "map pics"

    /* Small and very small:  map on top, pictures below */
    @media (max-width: 959px)
      .map-layout
        grid-template-columns: 1fr
        grid-template-rows: auto auto
        grid-template-areas: "map" "pics"

    /* Assign areas */
    .map-panel
      grid-area: map
      background: #f0f0f0
      height: 100%

    .picture-panel
      grid-area: pics
      background: olive
      height: 100%
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy, AfterViewInit {
  private map?: Map;

  constructor() {
  }

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private initMap(): void {
    this.map = new Map('map').setView([50, 20], 12);

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
