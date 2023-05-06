import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Shuttle } from '@models/shuttle';
import { District } from '@models/district';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { AnalyticsEvent } from '../../logging/analytics-event';

@Component({
  selector: 'sf-shuttle-item',
  templateUrl: './sf-shuttle-item.component.html',
  styleUrls: ['./sf-shuttle-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SfShuttleItemComponent {
  @Input() shuttle: Shuttle;
  @Input() lang: string;
  @Input() locale: string;

  @Input() justCalled: boolean = false;
  @Input() lastCalledDate: Date | undefined;
  @Input() showRating: boolean = false;
  @Input() showCallButton: boolean = false;
  @Input() showRateButton: boolean = false;
  @Input() district: District | undefined = undefined;
  @Input() showLocality: boolean = false;
  @Input() showPhone: boolean = false;

  ListAction = ListAction;
  @Input() listAction: ListAction | undefined = undefined;

  @Output() onItemTapped = new EventEmitter<{
    shuttleId: string;
  }>();

  @Output() onRateTapped = new EventEmitter<{
    shuttleId: string;
  }>();

  @Output() onCallTapped = new EventEmitter<{
    shuttle: Shuttle;
  }>();

  @Output() onListActionTapped = new EventEmitter<{
    shuttle: Shuttle;
    action: ListAction;
  }>();

  itemTapped() {
    this.onItemTapped.emit({ shuttleId: this.shuttle.id });
    logEvent(getAnalytics(), AnalyticsEvent.ShuttleItemTapped);
  }

  calLTapped(event) {
    event.stopPropagation();
    event.preventDefault();
    this.onCallTapped.emit({ shuttle: this.shuttle });
    logEvent(getAnalytics(), AnalyticsEvent.CallButtonTapped);
  }

  rateTapped(event) {
    event.stopPropagation();
    event.preventDefault();
    this.onRateTapped.emit({ shuttleId: this.shuttle.id });
    logEvent(getAnalytics(), AnalyticsEvent.RateButtonTapped);
  }

  listActionTapped(event) {
    event.stopPropagation();
    event.preventDefault();
    this.onListActionTapped.emit({
      shuttle: this.shuttle,
      action: this.listAction,
    });
  }

  shouldShowRatingBadge() {
    return (
      this.showRating &&
      this.shuttle.avgRating?.totalAvg &&
      this.shuttle?.avgRating?.totalAvg > 0
    );
  }

  shouldShowLocality() {
    return (
      this.showLocality &&
      this.shuttle.address?.locality?.de &&
      this.shuttle.address?.locality?.it
    );
  }
}

export enum ListAction {
  AddToFavorites,
  RemoveFromFavorites,
  AddToBlacklisted,
  RemoveFromBlacklisted,
}
