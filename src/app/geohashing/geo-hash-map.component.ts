import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {MapComponent} from '../map/map.component';
import {Icon, LatLngBounds, LatLngExpression, Marker, Rectangle, LayerGroup, Circle} from 'leaflet';
import {GEOHASH_CENTERS, INITIAL_CENTER} from '../app.tokens';
import {GeoHashService} from './geo-hash.service';
import {GeoHash} from './geo-hash.model';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-geohash-map',
  imports: [MapComponent, MatTooltip],
  template: `
    <div class="geohash-map-container">
      <app-map [center]="mapCenter()" (boundsChange)="boundsChange.emit($event)"/>
      <div class="control-panel">
        <button (click)="onForecastClick()" aria-label="Forecast" matTooltip="Forecast">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
          </svg>
        </button>
        <button (click)="onGlobeClick()" aria-label="Globe" matTooltip="Globalhash">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor"
                  d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host
      display: flex
      height: 100%
      width: 100%

    .geohash-map-container
      flex-grow: 1
      position: relative

    .control-panel
      position: absolute
      top: 10px
      right: 10px
      z-index: 1000
      display: flex
      flex-direction: column
      gap: 8px
      background: white
      padding: 8px
      border-radius: 4px
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65)

      button
        background: none
        border: none
        cursor: pointer
        padding: 4px
        display: flex
        align-items: center
        justify-content: center
        border-radius: 4px
        color: #444

        &:hover
          background-color: #f4f4f4
          color: #000
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoHashMapComponent {
  private readonly geoHashService = inject(GeoHashService);
  private readonly initialCenter = inject(INITIAL_CENTER) as [number, number];
  private readonly geohashCenters = inject(GEOHASH_CENTERS);

  readonly mapComponent = viewChild.required(MapComponent);

  // From route
  readonly lat = input<string>();
  readonly lng = input<string>();

  readonly boundsChange = output<LatLngBounds>();

  readonly graticule = signal<{ lat: number, lng: number }>({
    lat: Math.floor(this.initialCenter[0]),
    lng: Math.floor(this.initialCenter[1])
  });

  readonly mapCenter = signal<LatLngExpression>(this.initialCenter);
  readonly geoHash = signal<GeoHash | undefined>(undefined);
  private forecastDisplayed = signal<boolean>(false);
  private globalHashDisplayed = signal<boolean>(false);

  private geoHashPoints?: LayerGroup;
  private forecastMarker?: LayerGroup;
  private globalHashMarker?: LayerGroup;
  private graticuleLayers?: LayerGroup;
  private geohashCentersLayers?: LayerGroup;

  constructor() {
    effect(() => {
      const map = this.mapComponent().leafletMap();
      if (map) {
        if (this.geohashCentersLayers) {
          this.geohashCentersLayers.remove();
        }
        this.geohashCentersLayers = new LayerGroup().addTo(map);
        for (const center of this.geohashCenters) {
          new Circle(center, {
            radius: 25000,
            color: 'lightblue',
            weight: 2,
            fillOpacity: 0.2
          }).addTo(this.geohashCentersLayers);
        }
      }
      map?.setZoom(8)
    });

    effect(() => {
      const g = this.graticule();
      const map = this.mapComponent().leafletMap();
      if (map) {
        if (this.graticuleLayers) {
          this.graticuleLayers.remove();
        }
        this.graticuleLayers = new LayerGroup().addTo(map);
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            new Rectangle(
              [[g.lat + i, g.lng + j], [g.lat + i + 1, g.lng + j + 1]],
              {
                color: '#888',
                weight: 1,
                fill: false,
                interactive: false
              }
            ).addTo(this.graticuleLayers);
          }
        }
      }

    });

    effect(() => {
      const l = this.lat();
      const n = this.lng();
      if (l !== undefined && n !== undefined) {
        const latNum = parseInt(l, 10);
        const lngNum = parseInt(n, 10);
        this.graticule.set({lat: latNum, lng: lngNum});
        this.mapCenter.set([latNum + 0.5, lngNum + 0.5]);
      } else {
        this.graticule.set({
          lat: Math.floor(this.initialCenter[0]),
          lng: Math.floor(this.initialCenter[1])
        });
        this.mapCenter.set(this.initialCenter);
      }
    });

    effect(() => {
      const graticule = this.graticule();
      const date = this.getToday();
      this.geoHashService.getGeoHash(graticule.lat, graticule.lng, date).subscribe(gh => {
        this.geoHash.set(gh);
      });
    });

    effect(() => {
      const gh = this.geoHash();
      const map = this.mapComponent().leafletMap();
      if (gh && map) {
        if (this.geoHashPoints) {
          this.geoHashPoints.remove();
        }
        this.geoHashPoints = new LayerGroup().addTo(map);

        const fracLat = gh.location[0] - Math.floor(gh.location[0]);
        const fracLng = gh.location[1] - Math.floor(gh.location[1]);
        const g = this.graticule();

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const lat = g.lat + i + fracLat;
            const lng = g.lng + j + fracLng;
            const m = new Marker([lat, lng], {
              icon: new Icon({iconUrl: 'assets/leaflet/marker-icon.png'})
            }).addTo(this.geoHashPoints);

            m.bindPopup(this.renderLabel({...gh, location: [lat, lng]}));

            if (i === 0 && j === 0) {
              m.openPopup();
              map.setView([lat, lng], map.getZoom());
            }
          }
        }
      }
    });
  }


  private renderLabel(gh: GeoHash): string {
    return `GeoHash: ${gh.location[0].toFixed(6)}/${gh.location[1].toFixed(6)}<br>Date: ${gh.date} / DJIA: ${gh.djia}`;
  }

  onForecastClick(): void {

    if (this.forecastDisplayed()) {
      this.forecastMarker?.remove();
      this.forecastDisplayed.set(false);
      return;
    }

    this.geoHashService.getForecast().subscribe(forecast => {
      const map = this.mapComponent().leafletMap();
      const graticule = this.graticule();
      if (!map || !forecast || forecast.length === 0) {
        alert('no forecast available');
        return;
      }
      this.forecastMarker = new LayerGroup().addTo(map);
      this.forecastDisplayed.set(true);
      map.setView([graticule.lat + 0.5, graticule.lng + 0.5], 8);
      forecast.forEach((forecast, index) => {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const lat = graticule.lat + i + forecast.latFraction;
            const lng = graticule.lng + j + forecast.lonFraction;
            const m = new Marker([lat, lng], {
              icon: new Icon({iconUrl: 'pin-question.png'}),
              title: forecast.date
            }).addTo(this.forecastMarker!);
            m.bindPopup(`<b>${forecast.date}</b><br>${lat.toFixed(6)}/${lng.toFixed(6)}`);
          }
        }
      });
    });
  }

  onGlobeClick(): void {
    if (this.globalHashDisplayed()) {
      this.globalHashDisplayed.set(false);
      const map = this.mapComponent().leafletMap();
      if (map && this.globalHashMarker) {
        map.removeLayer(this.globalHashMarker)
        map.setView([this.graticule().lat + 0.5, this.graticule().lng + 0.5], 4);
      }
      return;
    }
    this.geoHashService.getGlobalHash().subscribe(gh => {
      this.globalHashDisplayed.set(true);
      const map = this.mapComponent().leafletMap();
      if (map) {
        this.globalHashMarker = new LayerGroup().addTo(map);
        map.setView(gh.location, 10);
        const m = new Marker(gh.location, {
          icon: new Icon({iconUrl: 'pin-target.png'}),
          title: 'GlobalHash'
        }).addTo(this.globalHashMarker!);
        m.bindPopup(`<b>Globalhash</b><br>${gh.location[0].toFixed(6)}/${gh.location[1].toFixed(6)}`);
      }
    })
  }

  private getToday(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
