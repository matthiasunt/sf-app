import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShuttlesService } from '@services/data/shuttles.service';

import { RatingsService } from '@services/data/ratings.service';
import { LocalDataService } from '@services/data/local-data.service';
import { Rating } from '@models/rating';
import { Shuttle } from '@models/shuttle';
import { Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NavController } from '@ionic/angular';
import { AuthService } from '@services/auth.service';
import { HistoryElement } from '@models/history-element';
import { trackShuttleById } from '../../utils/track-by-id.utils';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.page.html',
  styleUrls: ['./ratings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingsPage {
  private unsubscribe$ = new Subject<void>();
  private authService = inject(AuthService);

  trackById(index: number, item: Rating): number {
    // Some hashing
    return item.id
      .split('')
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  }

  shuttle$: Observable<Shuttle> = this.shuttlesService.getShuttle(
    this.activatedRoute.snapshot.paramMap.get('id')
  );

  ratings$ = this.shuttle$.pipe(
    switchMap((shuttle) => this.ratingsService.getRatings(shuttle.id))
  );

  userRating$: Observable<Rating> = this.ratings$.pipe(
    switchMap((ratings) =>
      this.authService.userId$.pipe(
        map((userId) => ratings.find((r) => r.userId === userId))
      )
    )
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    public translate: TranslateService,
    public localDataService: LocalDataService,
    private shuttlesService: ShuttlesService,
    private ratingsService: RatingsService
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async userRatingClicked() {
    const currentUrl = this.router.url;
    const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
    await this.navCtrl.navigateForward(`${currentUrl}/rate/${shuttleId}`);
  }

  public orderByChanged(event) {
    if (event) {
      this.ratings$ = this.ratings$.pipe(
        map((ratings: Rating[]) => {
          if (ratings.length > 1) {
            switch (event.detail.value) {
              case 'date_dsc':
                return ratings.sort((a, b) =>
                  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
                );
              case 'date_asc':
                return ratings.sort((a, b) =>
                  a.date < b.date ? -1 : a.date > b.date ? 1 : 0
                );
              case 'rating_dsc':
                return ratings.sort((a, b) =>
                  a.totalAvg < b.totalAvg ? 1 : a.totalAvg > b.totalAvg ? -1 : 0
                );
              case 'rating_asc':
                return ratings.sort((a, b) =>
                  a.totalAvg < b.totalAvg ? -1 : a.totalAvg > b.totalAvg ? 1 : 0
                );
              default:
                return ratings;
            }
          } else {
            return ratings;
          }
        })
      );
    }
  }
}
