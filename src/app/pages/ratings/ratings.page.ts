import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';

import {RatingsService} from '@services/data/ratings/ratings.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {Rating} from '@models/rating';
import {Shuttle} from '@models/shuttle';
import {combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-ratings',
    templateUrl: './ratings.page.html',
    styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();

    shuttle: Shuttle;
    ratings: Rating[];
    userRating: Rating;
    locale: string;

    constructor(private activatedRoute: ActivatedRoute,
                private navCtrl: NavController,
                private router: Router,
                public translate: TranslateService,
                private localDataService: LocalDataService,
                private shuttlesService: ShuttlesService,
                private ratingsService: RatingsService,
    ) {
    }

    async ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');

        this.localDataService.lang
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((lang) => this.locale = lang === 'de_st' ? 'de' : lang);

        combineLatest(
            this.shuttlesService.allShuttles,
            this.ratingsService.userRatings,
            this.ratingsService.getShuttleRatings(shuttleId))
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([allShuttles, userRatings, shuttleRatings]) => {
                this.shuttle = allShuttles.find((shuttle: Shuttle) => shuttle._id === shuttleId);
                this.userRating = userRatings.find((rating) => rating.shuttleId === this.shuttle._id);
                if (this.userRating) {
                    this.ratings = shuttleRatings.filter(rating => rating._id !== this.userRating._id).toArray();
                } else {
                    this.ratings = shuttleRatings.toArray();
                }

            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    userRatingClicked() {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + this.shuttle._id);
    }

    public orderByChanged(event) {
        if (this.ratings.length > 1) {
            switch (event.detail.value) {
                case 'date_dsc':
                    this.ratings.sort((a, b) => (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
                    break;
                case 'date_asc':
                    this.ratings.sort((a, b) => (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
                    break;
                case 'rating_dsc':
                    this.ratings.sort((a, b) => (a.totalAvg < b.totalAvg) ? 1 : ((a.totalAvg > b.totalAvg) ? -1 : 0));
                    break;
                case 'rating_asc':
                    this.ratings.sort((a, b) => (a.totalAvg < b.totalAvg) ? -1 : ((a.totalAvg > b.totalAvg) ? 1 : 0));
                    break;
                default:
                    break;
            }
        }
    }
}
