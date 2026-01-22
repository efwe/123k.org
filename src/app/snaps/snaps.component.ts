import {ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal} from '@angular/core';
import {SnapCardComponent} from './snap-card.component';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {Snap} from './snap.model';
import {BreakpointObserver} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-snaps',
  imports: [SnapCardComponent, MatPaginatorModule],
  template: `
    <div class="snap-layout">
      @for (snap of pagedSnaps(); track snap.id) {
        <app-snap-card [snap]="snap" (cardClick)="snapClick.emit($event)" />
      } @empty {
        <p>No snaps in this area.</p>
      }
    </div>
    @if (snaps().length > 0) {
      <mat-paginator
        [length]="snaps().length"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [showFirstLastButtons]="true"
        [hidePageSize]="true"
        [pageSizeOptions]="[]"
        (page)="handlePageEvent($event)"
        aria-label="Select page of snaps">
      </mat-paginator>
    }
  `,
  styles: `
    :host
      display: flex
      flex-direction: column

    .snap-layout
      display: grid
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
      gap: 0.5rem
      padding: 0.5rem
      flex: 1

    mat-paginator
      border-top: 1px solid rgba(0, 0, 0, 0.12)
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapsComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isLargeScreen = toSignal(
    this.breakpointObserver.observe('(min-width: 1900px)').pipe(map((result) => result.matches)),
    {initialValue: false},
  );

  snaps = input.required<Snap[]>();
  snapClick = output<Snap>();
  pageSize = linkedSignal(() => (this.isLargeScreen() ? 12 as number : 5 as number));
  pageIndex = linkedSignal({
    source: this.snaps,
    computation: () => 0,
  });

  constructor() {
  }

  pagedSnaps = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.snaps().slice(start, end);
  });

  handlePageEvent(e: PageEvent) {
    this.pageSize.set(e.pageSize);
    this.pageIndex.set(e.pageIndex);
  }
}
