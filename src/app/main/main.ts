import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {SnapsMapComponent} from '../snaps/snaps-map.component';
import {SnapsComponent} from '../snaps/snaps.component';
import {LatLngBounds} from 'leaflet';
import {SnapsService} from '../snaps/snaps.service';
import {Snap} from '../snaps/snap.model';

@Component({
  selector: 'app-main',
  imports: [MatGridListModule, SnapsMapComponent, SnapsComponent],
  templateUrl: './main.html',
  styleUrl: './main.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {
  private snapsService = inject(SnapsService);

  snaps = signal<Snap[]>([]);
  selectedSnap = signal<Snap | undefined>(undefined);

  onBoundsChange(bounds: LatLngBounds) {
    this.snapsService.getSnaps(bounds).subscribe(snaps => {
      this.snaps.set(snaps);
    });
  }

  onSnapSelected(snap: Snap) {
    this.selectedSnap.set(snap);
  }

  onClearSelection() {
    this.selectedSnap.set(undefined);
  }
}
