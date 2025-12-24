import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Snap } from './snap.model';

@Component({
  selector: 'app-snap-card',
  imports: [NgOptimizedImage, MatCardModule, MatButtonModule, MatDialogModule],
  template: `
    <mat-card class="snap-card" (click)="openImage()" (keydown.enter)="openImage()" tabindex="0" role="button" [attr.aria-label]="'View ' + snap().title">
      <div class="thumbnail-container">
        <img mat-card-image
             [ngSrc]="snap().imageUrl"
             [alt]="snap().title"
             fill
             style="object-fit: cover;">
      </div>
    </mat-card>
  `,
  styles: `
    .snap-card
      cursor: pointer
      overflow: hidden
      height: 100%

    .thumbnail-container
      position: relative
      width: 100%
      height: 100%
      aspect-ratio: 4 / 3
      overflow: hidden

    img
      display: block
      width: 100%
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapCardComponent {
  snap = input.required<Snap>();
  private dialog = inject(MatDialog);

  openImage() {
    this.dialog.open(SnapImageDialogComponent, {
      data: { imageUrl: this.snap().imageUrl, title: this.snap().title },
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }
}

@Component({
  selector: 'app-snap-image-dialog',
  imports: [NgOptimizedImage, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title id="snap-dialog-title">{{ data.title }}</h2>
    <mat-dialog-content aria-labelledby="snap-dialog-title">
      <div class="image-container">
        <img [ngSrc]="data.imageUrl"
             [alt]="data.title"
             fill
             priority
             style="object-fit: contain;">
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .image-container
      position: relative
      width: 80vw
      height: 80vh
      min-width: 300px
      min-height: 300px
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapImageDialogComponent {
  data = inject<{ imageUrl: string; title: string }>(MAT_DIALOG_DATA);
}
