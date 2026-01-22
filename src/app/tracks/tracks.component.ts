import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MapComponent } from '../map/map.component';
import { TrackService } from './track.service';
import { Track } from './track.model';
import { INITIAL_CENTER } from '../app.tokens';
import { LatLngExpression, Polyline } from 'leaflet';

@Component({
  selector: 'app-tracks',
  imports: [DatePipe, MatCardModule, MapComponent],
  template: `
    <div class="tracks-layout">
      <div class="map-panel">
        <app-map [center]="mapCenter()" />
      </div>

      <div class="tracks-panel">
        <div class="tracks-list">
          @for (track of tracks(); track track.id) {
            <mat-card class="track-card" (click)="selectTrack(track.id)">
              <mat-card-header>
                <mat-card-title>{{ track.title }}</mat-card-title>
                <mat-card-subtitle>{{ track.startTime | date:'medium' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{ track.description }}</p>
                <p>Distance: {{ (track.distance / 1000).toFixed(2) }} km</p>
              </mat-card-content>
            </mat-card>
          } @empty {
            <div class="no-tracks">No tracks found.</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host
      display: block
      height: calc(100dvh - 64px)

    .tracks-layout
      display: grid
      height: 100%

    @media (min-width: 960px)
      .tracks-layout
        grid-template-columns: 4fr 1fr
        grid-template-rows: auto
        grid-template-areas: "map list"

    @media (max-width: 959px)
      .tracks-layout
        grid-template-columns: 1fr
        grid-template-rows: auto auto
        grid-template-areas: "map" "list"

    .map-panel
      grid-area: map
      height: 100%

    .tracks-panel
      grid-area: list
      height: 100%
      overflow-y: auto
      border-left: 1px solid rgba(0, 0, 0, 0.12)

    .tracks-list
      padding: 0.5rem
      display: flex
      flex-direction: column
      gap: 0.5rem

    .track-card
      cursor: pointer
      transition: background-color 0.2s
      &:hover
        background-color: rgba(0, 0, 0, 0.04)
      &:focus
        outline: 2px solid #3f51b5
        background-color: rgba(0, 0, 0, 0.04)

    .no-tracks
      padding: 1rem
      text-align: center
      color: rgba(0, 0, 0, 0.54)
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TracksComponent implements OnDestroy {
  private trackService = inject(TrackService);
  private initialCenter = inject(INITIAL_CENTER);

  readonly mapComponent = viewChild.required(MapComponent);

  tracks = signal<Track[]>([]);
  mapCenter = signal<LatLngExpression>(this.initialCenter);
  selectedTrack = signal<Track | undefined>(undefined);
  private polyline: Polyline | undefined;

  constructor() {
    this.trackService.findAll().subscribe(tracks => {
      this.tracks.set(tracks);
    });

    effect(() => {
      const track = this.selectedTrack();
      const map = this.mapComponent().leafletMap();

      if (this.polyline) {
        this.polyline.remove();
        this.polyline = undefined;
        return;
      }

      if (track && map) {
        const latLngs = track.trackPoints.map(p => p.location as unknown as [number,number]);
        this.polyline = new Polyline(latLngs, {
          color: 'DarkSlateGray',
          weight: 5,
        }).addTo(map);

        map.fitBounds(this.polyline.getBounds());
      }
    });
  }

  selectTrack(id: string): void {
    this.trackService.getTrack(id).subscribe(track => {
      this.selectedTrack.set(track);
    });
  }

  ngOnDestroy(): void {
    if (this.polyline) {
      this.polyline.remove();
    }
  }
}
