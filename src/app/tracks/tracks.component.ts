import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild, OnDestroy, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MapComponent } from '../map/map.component';
import { TrackService } from './track.service';
import { Track } from './track.model';
import { INITIAL_CENTER } from '../app.tokens';
import { LatLngExpression, Polyline } from 'leaflet';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tracks',
  imports: [DatePipe, MatCardModule, MatSidenavModule, MatButtonModule, MatIconModule, MapComponent],
  templateUrl: './tracks.component.html',
  styleUrl: './tracks.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TracksComponent implements OnDestroy {
  private trackService = inject(TrackService);
  private initialCenter = inject(INITIAL_CENTER);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly mapComponent = viewChild.required(MapComponent);

  tracks = signal<Track[]>([]);
  mapCenter = signal<LatLngExpression>(this.initialCenter);
  selectedTrack = signal<Track | undefined>(undefined);
  isDrawerOpen = signal(false);

  private polyline: Polyline | undefined;

  private destroyed$ = new Subject<void>();

  constructor() {
    this.trackService.findAll().subscribe(tracks => {
      this.tracks.set(tracks);
    });

    // Deep link support: when URL is /tracks/:id, load/select that track
    this.route.paramMap
      .pipe(
        map(pm => pm.get('id')),
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
      )
      .subscribe(id => {
        if (!id) {
          this.selectedTrack.set(undefined);
          this.isDrawerOpen.set(false);
          return;
        }
        this.loadAndOpenTrack(id);
      });

    effect(() => {
      const track = this.selectedTrack();
      const map = this.mapComponent().leafletMap();

      if (this.polyline) {
        this.polyline.remove();
        this.polyline = undefined;
      }

      if (track && map) {
        const latLngs = track.trackPoints.map(p => p.location as unknown as [number, number]);
        this.polyline = new Polyline(latLngs, {
          color: 'DarkSlateGray',
          weight: 5,
        }).addTo(map);

        map.fitBounds(this.polyline.getBounds());
      }
    });
  }

  selectTrack(id: string): void {
    // Update the address bar: /tracks/:id (shareable)
    this.router.navigate(['/tracks', id]);
  }

  private loadAndOpenTrack(id: string): void {
    this.trackService.getTrack(id).subscribe(track => {
      this.selectedTrack.set(track);
      this.isDrawerOpen.set(true);
    });
  }

  closeDrawer(): void {
    // Clear deep link when closing, so URL returns to /tracks
    this.router.navigate(['/tracks']);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.polyline) {
      this.polyline.remove();
    }
  }
}
