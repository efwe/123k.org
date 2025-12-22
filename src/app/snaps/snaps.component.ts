import {ChangeDetectionStrategy, Component, effect, inject, input} from '@angular/core';
import {SnapsService} from './snaps.service';
import {LatLngBounds} from 'leaflet';
import {JsonPipe} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, switchMap, tap} from 'rxjs';

@Component({
  selector: 'app-snaps',
  imports: [JsonPipe],
  template: `

    <div class="snap-layout">

      @for (snap of snaps(); track snap.id) {
        <div>{{ snap | json }}</div>
      }
    </div>
  `,
  styles: `
    .snap-layout
      display: grid
      grid-template-columns: repeat(2, 1fr)
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
