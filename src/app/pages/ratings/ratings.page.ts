import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';

import {RatingsService} from '@services/data/ratings/ratings.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {Rating} from '@models/rating';
import {Shuttle} from '@models/shuttle';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {List, Map} from 'immutable';
import {NavController} from '@ionic/angular';
import {getBeautifulDateString} from '@tools/sf-tools';

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
        this.shuttle = await this.shuttlesService.getShuttle(shuttleId);

        this.ratingsService.ratingsByShuttles
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((ratingsByShuttles: Map<string, List<Rating>>) => {
                // Fetch User Rating and remove it from Ratings
                this.userRating = this.ratingsService.getRatingByUserForShuttle(shuttleId);
                const ratings: List<Rating> = ratingsByShuttles.get(shuttleId);
                this.ratings = ratings ? ratings.toArray() : [];
                if (this.userRating) {
                    this.ratings.filter(rating => rating._id !== this.userRating._id);
                }
                this.ratings.sort((a, b) => {
                        return (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0);
                    }
                );
            });
        this.localDataService.lang
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((lang) => this.locale = lang === 'de_st' ? 'de' : lang);
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

    getDate(date: string) {
        return getBeautifulDateString(date, this.locale);
    }

}
