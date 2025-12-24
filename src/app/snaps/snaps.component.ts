import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {SnapsService} from './snaps.service';
import {LatLngBounds} from 'leaflet';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, switchMap} from 'rxjs';
import { SnapCardComponent } from './snap-card.component';

@Component({
  selector: 'app-snaps',
  imports: [SnapCardComponent],
  template: `
    <div class="snap-layout">
      @for (snap of snaps(); track snap.id) {
        <app-snap-card [snap]="snap" />
      } @empty {
        <p>No snaps in this area.</p>
      }
    </div>
  `,
  styles: `
    .snap-layout
      display: grid
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
      gap: 1rem
      padding: 1rem
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapsComponent {
  private snapsService = inject(SnapsService);

  box = input.required<LatLngBounds>();

  constructor() {
  }


  snaps = toSignal(
    toObservable(this.box).pipe(
      distinctUntilChanged((prev, curr) => prev.contains(curr)),
      switchMap(box => this.snapsService.getSnaps(box))
    ),
    { initialValue: [] }
  );

}
