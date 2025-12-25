import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {SnapCardComponent} from './snap-card.component';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {Snap} from './snap.model';

@Component({
  selector: 'app-snaps',
  imports: [SnapCardComponent, MatPaginatorModule],
  template: `
    <div class="snap-layout">
      @for (snap of pagedSnaps(); track snap.id) {
        <app-snap-card [snap]="snap" />
      } @empty {
        <p>No snaps in this area.</p>
      }
    </div>
    @if (snaps().length > 0) {
      <mat-paginator
        [length]="snaps().length"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [pageSizeOptions]="[5, 10, 25, 100]"
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
      gap: 1rem
      padding: 1rem
      flex: 1

    mat-paginator
      border-top: 1px solid rgba(0, 0, 0, 0.12)
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapsComponent {

  snaps = input.required<Snap[]>();
  pageSize = signal(5);
  pageIndex = signal(0);

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
