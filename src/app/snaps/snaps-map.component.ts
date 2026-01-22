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

type SnapMarker = Marker & { snapId?: string };

@Component({
  selector: 'app-snaps-map',
  imports: [MapComponent],
  template: `
    <app-map [center]="center()" (boundsChange)="boundsChange.emit($event)" />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapsMapComponent implements OnDestroy {
  mapComponent = viewChild.required(MapComponent);
  center = input<LatLngExpression>(inject(INITIAL_CENTER));
  snaps = input<Snap[]>([]);
  selectedSnap = input<Snap | undefined>(undefined);
  boundsChange = output<LatLngBounds>();

  clearSelection = output<void>();

  private markersLayer?: LayerGroup;
  private openedMarker?: SnapMarker;

  private map?: Map;
  private mapListenersAttached = false;

  constructor() {
    effect(() => {
      const map = this.mapComponent().leafletMap();
      const snaps = this.snaps();

      if (map) {
        this.map = map;
        this.attachMapListenersOnce(map);

        this.renderMarkers(map, snaps);
        this.updateSelectedMarker(this.selectedSnap());
      }
    });

    effect(() => {
      const map = this.mapComponent().leafletMap();
      const selected = this.selectedSnap();

      if (map && selected) {
        map.setView(selected.location, 16, { animate: true });
      }
    });
  }

  private attachMapListenersOnce(map: Map) {
    if (this.mapListenersAttached) return;
    this.mapListenersAttached = true;

    const clearOnUserAction = (e: unknown) => {
      // Leaflet usually sets `originalEvent` for user-triggered interactions (wheel, touch, etc.).
      // For programmatic setView/fitBounds it is typically absent.
      const originalEvent = (e as { originalEvent?: unknown } | undefined)?.originalEvent;
      if (originalEvent) {
        this.clearSelection.emit();
      }
    };

    map.on('zoomstart', clearOnUserAction);
    map.on('movestart', clearOnUserAction);
  }

  private updateSelectedMarker(selected: Snap | undefined) {
    if (!this.markersLayer) return;

    if (this.openedMarker) {
      this.openedMarker.closePopup();
      this.openedMarker = undefined;
    }

    if (!selected) return;

    let found: SnapMarker | undefined;

    this.markersLayer.eachLayer((layer) => {
      const marker = layer as SnapMarker;
      if (marker.snapId === selected.id) {
        found = marker;
      }
    });

    if (found) {
      found.openPopup();
      this.openedMarker = found;
    }
  }

  private renderMarkers(map: Map, snaps: Snap[]): void {
    if (!this.markersLayer) {
      this.markersLayer = new LayerGroup().addTo(map);
    }

    this.markersLayer.clearLayers();
    this.openedMarker = undefined;

    for (const snap of snaps) {
      const marker = new Marker(snap.location, {
        icon: new Icon({ iconUrl: 'assets/leaflet/marker-icon.png' })
      }) as SnapMarker;

      marker.snapId = snap.id;

      marker.bindPopup(`
        <img src="${snap.thumbNailUrl}" alt="${snap.title}" width="${snap.thumbNailWidth}" height="${snap.thumbNailHeight}" style="display: block; margin: 0 auto;">
      `);

      marker.addTo(this.markersLayer);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.off('zoomstart');
      this.map.off('movestart');
    }
    if (this.markersLayer) {
      this.markersLayer.remove();
    }
  }
}
