import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';

import {RatingsService} from '@services/data/ratings/ratings.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {Rating} from '@models/rating';
import {Shuttle} from '@models/shuttle';
import {getBeautifulDateString} from '../../tools/sf-tools';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {List, Map} from 'immutable';

@Component({
    selector: 'app-ratings',
    templateUrl: './ratings.page.html',
    styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();

    shuttle: Shuttle;
    ratings: Rating[] = [];
    locale: string;

    constructor(private activatedRoute: ActivatedRoute,
                public translate: TranslateService,
                private localData: LocalDataService,
                private shuttlesService: ShuttlesService,
                private ratingsService: RatingsService,
    ) {
    }

    async ngOnInit() {
        this.locale = this.localData.getLocaleFromPrefLang();
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.shuttlesService.getShuttle(shuttleId);

        this.ratingsService.ratingsByShuttles
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((ratingsByShuttles: Map<string, List<Rating>>) => {
                const ratings: List<Rating> = ratingsByShuttles.get(shuttleId);
                console.log(ratings);
                this.ratings = ratings ? ratings.toArray() : [];
                this.ratings.sort((a, b) => {
                        return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
                    }
                );
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public orderByChanged(event) {
        if (this.ratings.length > 1) {
            switch (event.detail.value) {
                case 'date_dsc':
                    this.ratings.sort((a, b) => (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0));
                    break;
                case 'date_asc':
                    this.ratings.sort((a, b) => (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0));
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
