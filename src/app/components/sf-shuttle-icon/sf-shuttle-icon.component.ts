import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-sf-shuttle-icon',
  templateUrl: './sf-shuttle-icon.component.html',
  styleUrls: ['./sf-shuttle-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SfShuttleIconComponent implements OnInit {
  @Input() color = '#99CC33';

  constructor() {}

  ngOnInit() {}
}
