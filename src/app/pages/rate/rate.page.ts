import {Component, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {NavController} from '@ionic/angular';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {getContrastColor} from '../../tools/sf-tools';
import {Rating} from '@models/rating';
import {RatingsService} from '@services/data/ratings/ratings.service';
import {ListElement} from '@models/list-element';
import {AuthService} from '@services/auth/auth.service';

@Component({
    selector: 'app-rate',
    templateUrl: './rate.page.html',
    styleUrls: ['./rate.page.scss'],
})
export class RatePage implements OnInit {


    shuttle: Shuttle;
    shuttleColor: string;
    alreadyRatedByUser = false;
    ratingForm: any = {
        service: '3',
        reliabilityAndPunctuality: '3',
        drivingStyleAndSecurity: '3',
        price: '3',
        review: '',
    };

    constructor(private navCtrl: NavController,
                private activatedRoute: ActivatedRoute,
                public translate: TranslateService,
                private authService: AuthService,
                private ratingService: RatingsService,
                private shuttlesService: ShuttlesService,
                private colorGenerator: ColorGeneratorService,
    ) {
    }

    ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.fetchRatingByUser(shuttleId);
    }

    onSubmit() {
        console.log(this.ratingForm);
        const type = 'rating';
        const rating: Rating = {
            _id: `${this.shuttle._id}--${type}--${this.authService.getUserId()}`,
            userId: this.authService.getUserId(),
            shuttleId: this.shuttle._id,
            date: new Date().toISOString(),
            service: this.ratingForm.service,
            reliabilityAndPunctuality: this.ratingForm.reliabilityAndPunctuality,
            drivingStyleAndSecurity: this.ratingForm.drivingStyleAndSecurity,
            price: this.ratingForm.price,
            review: this.ratingForm.review,
            type: type,
        };
        if (this.alreadyRatedByUser) {
            this.ratingService.updateRating(rating);
        } else {
            this.ratingService.putRating(rating);
        }
        this.navCtrl.pop();
    }

    getToolbarStyle() {
        return {
            'background-color': this.shuttleColor,
            'color': getContrastColor(this.shuttleColor)
        };
    }

    private fetchRatingByUser(shuttleId: string) {
        const rating = this.ratingService.getRatingByUserForShuttle(shuttleId);
        if (rating) {
            this.alreadyRatedByUser = true;
            this.ratingForm.service = rating.service;
            this.ratingForm.reliabilityAndPunctuality = rating.reliabilityAndPunctuality;
            this.ratingForm.drivingStyleAndSecurity = rating.drivingStyleAndSecurity;
            this.ratingForm.price = rating.price;
            this.ratingForm.review = rating.review;
            console.log(rating);
        }
    }


}
