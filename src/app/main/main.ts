import { Component, ChangeDetectionStrategy } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-main',
  imports: [MatGridListModule, MapComponent],
  templateUrl: './main.html',
  styleUrl: './main.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {

}
