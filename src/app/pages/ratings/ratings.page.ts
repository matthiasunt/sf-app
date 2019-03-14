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

    getDate(date: string) {
        return getBeautifulDateString(date, this.locale);
    }

}
