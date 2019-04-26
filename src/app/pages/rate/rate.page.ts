import {Component, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {AlertController, NavController} from '@ionic/angular';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {getContrastColor} from '../../tools/sf-tools';
import {Rating} from '@models/rating';
import {RatingsService} from '@services/data/ratings/ratings.service';
import {AuthService} from '@services/auth/auth.service';
import {DocType} from '@models/doctype';

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
        service: 3,
        reliabilityAndPunctuality: 3,
        drivingStyleAndSecurity: 3,
        price: 3,
        review: '',
    };

    private userRating: Rating;

    constructor(private navCtrl: NavController,
                private alertCtrl: AlertController,
                private activatedRoute: ActivatedRoute,
                public translate: TranslateService,
                private authService: AuthService,
                private ratingsService: RatingsService,
                private shuttlesService: ShuttlesService,
                private colorGenerator: ColorGeneratorService,
    ) {
    }

    async ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.fetchRatingByUser(shuttleId);
    }

    async rateClicked() {
        const totalAvg = (this.ratingForm.service
            + this.ratingForm.reliabilityAndPunctuality
            + this.ratingForm.drivingStyleAndSecurity
            + this.ratingForm.price) / 4;

        const userId = await this.authService.getUserId();
        const rating: Rating = {
            _id: `${this.shuttle._id}--${DocType.Rating}--${userId}`,
            userId: userId,
            shuttleId: this.shuttle._id,
            date: new Date().toISOString(),
            totalAvg: totalAvg,
            service: this.ratingForm.service,
            reliabilityAndPunctuality: this.ratingForm.reliabilityAndPunctuality,
            drivingStyleAndSecurity: this.ratingForm.drivingStyleAndSecurity,
            price: this.ratingForm.price,
            review: this.ratingForm.review.trim(),
            type: DocType.Rating,
        };
        if (this.alreadyRatedByUser) {
            this.ratingsService.updateRating(rating);
        } else {
            this.ratingsService.putRating(rating);
        }
        this.navCtrl.pop();
    }

    public deleteClicked() {
        this.deleteRatingAlert();
    }

    getToolbarStyle() {
        return {
            'background-color': this.shuttleColor,
            'color': getContrastColor(this.shuttleColor)
        };
    }

    private fetchRatingByUser(shuttleId: string) {
        this.userRating = this.ratingsService.getRatingByUserForShuttle(shuttleId);
        if (this.userRating) {
            this.alreadyRatedByUser = true;
            this.ratingForm = {
                service: this.userRating.service,
                reliabilityAndPunctuality: this.userRating.reliabilityAndPunctuality,
                drivingStyleAndSecurity: this.userRating.drivingStyleAndSecurity,
                price: this.userRating.price,
                review: this.userRating.review,
            };
        }
    }

    async deleteRatingAlert() {
        const alert = await this.alertCtrl.create({
            header: '',
            subHeader: this.translate.instant('history.msg.DELETE_ALL'),
            buttons: [
                {text: this.translate.instant('NO')},
                {
                    text: this.translate.instant('YES'),
                    handler: () => {
                        if (this.userRating) {
                            this.ratingsService.deleteRating(this.userRating);
                        }
                        this.navCtrl.pop();
                    }
                }
            ]
        });
        await alert.present();
    }


}
