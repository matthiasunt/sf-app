import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShuttlesService } from '@services/data/shuttles.service';

import { RatingsService } from '@services/data/ratings.service';
import { LocalDataService } from '@services/data/local-data.service';
import { Rating } from '@models/rating';
import { Shuttle } from '@models/shuttle';
import { combineLatest, from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavController } from '@ionic/angular';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.page.html',
  styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private authService = inject(AuthService);

  shuttle: Shuttle;
  ratings: Rating[];
  userRating: Rating;
  locale: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    public translate: TranslateService,
    private localDataService: LocalDataService,
    private shuttlesService: ShuttlesService,
    private ratingsService: RatingsService
  ) {}

  async ngOnInit() {
    const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
    this.localDataService.lang
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((lang) => (this.locale = lang === 'de_st' ? 'de' : lang));

    combineLatest([
      from(this.authService.getUserId()),
      this.shuttlesService.allShuttles,
      from(this.ratingsService.getRatings(shuttleId)),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([userId, allShuttles, shuttleRatings]) => {
        this.shuttle = allShuttles.find(
          (shuttle: Shuttle) => shuttle.id === shuttleId
        );
        this.userRating = shuttleRatings.find((r) => r.userId === userId);
        this.ratings = shuttleRatings
          .filter((rating) => rating.id !== this.userRating.id)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  userRatingClicked() {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(currentUrl + '/rate/' + this.shuttle.id);
  }

  public orderByChanged(event) {
    if (this.ratings.length > 1) {
      switch (event.detail.value) {
        case 'date_dsc':
          this.ratings.sort((a, b) =>
            a.date < b.date ? 1 : a.date > b.date ? -1 : 0
          );
          break;
        case 'date_asc':
          this.ratings.sort((a, b) =>
            a.date < b.date ? -1 : a.date > b.date ? 1 : 0
          );
          break;
        case 'rating_dsc':
          this.ratings.sort((a, b) =>
            a.totalAvg < b.totalAvg ? 1 : a.totalAvg > b.totalAvg ? -1 : 0
          );
          break;
        case 'rating_asc':
          this.ratings.sort((a, b) =>
            a.totalAvg < b.totalAvg ? -1 : a.totalAvg > b.totalAvg ? 1 : 0
          );
          break;
        default:
          break;
      }
    }
  }
}
