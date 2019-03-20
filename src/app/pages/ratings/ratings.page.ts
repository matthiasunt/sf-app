import {Component, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {ActivatedRoute} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {Rating} from '@models/rating';
import {RatingsService} from '@services/data/ratings/ratings.service';
import {getBeautifulDateString} from '../../tools/sf-tools';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-ratings',
    templateUrl: './ratings.page.html',
    styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit {

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

    ngOnInit() {
        this.locale = this.localData.getLocaleFromPrefLang();
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        const ratings = this.ratingsService.getRatingsFromShuttle(shuttleId);
        this.ratings = ratings ? ratings.toArray() : [];
    }

    public orderByChanged(event) {
        if (this.ratings.length > 1) {
            switch (event.detail.value) {
                case 'date_dsc':
                    this.ratings.sort((a, b) => {
                            return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
                        }
                    );
                    break;
                case 'date_asc':
                    this.ratings.sort((a, b) => {
                            return (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0);
                        }
                    );
                    break;
                // case 'rating_dsc':
                //     this.ratings.sort((a, b) => {
                //             return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
                //         }
                //     );
                //     break;
                // case 'rating_dsc':
                //     this.ratings.sort((a, b) => {
                //             return (a.date < b.date) ? -1 : ((a.date > b.date) ? 1 : 0);
                //         }
                //     );
                //     break;
                default:
                    break;
            }
        }
    }

    getDate(date: string) {
        return getBeautifulDateString(date, this.locale);
    }

}
