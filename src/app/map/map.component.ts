import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {Map, TileLayer} from 'leaflet';
import "leaflet/dist/leaflet.css";

@Component({
  selector: 'app-map',
  imports: [MatGridListModule],
  template: `
    <mat-grid-list cols="10" rowHeight="100%">
      <mat-grid-tile colspan="9">
        <div #mapContainer id="map"></div>
      </mat-grid-tile>
      <mat-grid-tile colspan="1">
        <!-- List of images will go here -->
      </mat-grid-tile>
    </mat-grid-list>
  `,
  styles: `
    :host
      display: block
      height: calc(100dvh - 64px)

    #map
      height: 100%
      background-color: #f0f0f0

    mat-grid-list
      height: 100%

    ::ng-deep .mat-grid-tile-content
      display: block !important
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy, AfterViewInit {
  private map?: Map;

  ngAfterViewInit(): void {
    if (!this.map) {
      this.initMap();
    }
  }

  private initMap(): void {
    this.map = new Map('map').setView([50, 20], 12);

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.map.invalidateSize();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
