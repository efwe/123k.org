import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild
} from '@angular/core';
import {LatLngBounds, LatLngExpression, Map, TileLayer} from 'leaflet';
import {INITIAL_CENTER} from '../app.tokens';


@Component({
  selector: 'app-map',
  imports: [],
  template: `
    <div #mapContainer class="map-container"></div>
  `,
  styles: [`
    :host
      display: block
      height: 100%
      width: 100%

    .map-container
      height: 100%
      width: 100%
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy, AfterViewInit {
  private map = signal<Map | undefined>(undefined);
  private _bounds = signal<LatLngBounds | undefined>(undefined);
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  center = input<LatLngExpression>(inject(INITIAL_CENTER));
  boundsChange = output<LatLngBounds>();

  readonly leafletMap = this.map.asReadonly();
  readonly bounds = this._bounds.asReadonly();

  constructor() {
    effect(() => {
      const c = this.center();
      const m = this.map();
      if (m) {
        m.setView(c, m.getZoom());
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.map()) {
      this.initMap();
    }
  }

  private initMap(): void {
    const m = new Map(this.mapContainer().nativeElement).setView(this.center(), 13);

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);

    m.on('moveend', () => {
      const b = m.getBounds();
      this._bounds.set(b);
      this.boundsChange.emit(b);
    });

    this.map.set(m);

    // Initial
    const initialBounds = m.getBounds();
    this._bounds.set(initialBounds);
    this.boundsChange.emit(initialBounds);
  }

  ngOnDestroy(): void {
    const m = this.map();
    if (m) {
      m.remove();
    }
  }
}
