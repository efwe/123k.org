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

@Component({
  selector: 'app-geohash-map',
  imports: [MapComponent],
  template: `
    <div class="geohash-map-container">
      <app-map [center]="mapCenter()" (boundsChange)="boundsChange.emit($event)" />
    </div>
  `,
  styles: [`
    :host
      display: flex
      height: 100%
      width: 100%

    .geohash-map-container
      flex-grow: 1
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

  private markers?: LayerGroup;
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
      map?.setZoom(10)
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
        this.graticule.set({ lat: latNum, lng: lngNum });
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
        if (this.markers) {
          this.markers.remove();
        }
        this.markers = new LayerGroup().addTo(map);

        const fracLat = gh.location[0] - Math.floor(gh.location[0]);
        const fracLng = gh.location[1] - Math.floor(gh.location[1]);
        const g = this.graticule();

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const lat = g.lat + i + fracLat;
            const lng = g.lng + j + fracLng;
            const m = new Marker([lat, lng], {
              icon: new Icon({ iconUrl: 'assets/leaflet/marker-icon.png' })
            }).addTo(this.markers);

            m.bindPopup(this.renderLabel({ ...gh, location: [lat, lng] }));

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

  private getToday(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
