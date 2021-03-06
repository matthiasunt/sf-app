import {Component, OnDestroy, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, NavController} from '@ionic/angular';
import {ShuttlesService} from '@services/data/shuttles.service';
import {Rating, RatingForm} from '@models/rating';
import {RatingsService} from '@services/data/ratings.service';
import {AuthService} from '@services/auth.service';
import {DocType} from '@models/doctype';
import {takeUntil} from 'rxjs/operators';
import {combineLatest, Observable, Subject} from 'rxjs';

@Component({
    selector: 'app-rate',
    templateUrl: './rate.page.html',
    styleUrls: ['./rate.page.scss'],
})
export class RatePage implements OnInit, OnDestroy {


    private unsubscribe$ = new Subject<void>();

    shuttle$: Observable<Shuttle>;
    alreadyRatedByUser: boolean;
    ratingForm: RatingForm = {
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
    ) {
        this.alreadyRatedByUser = false;
    }

    private static ratingFormsEqual(a: RatingForm, b: RatingForm): boolean {
        return a.service === b.service
            && a.reliabilityAndPunctuality === b.reliabilityAndPunctuality
            && a.drivingStyleAndSecurity === b.drivingStyleAndSecurity
            && a.price === b.price
            && a.review === b.review;
    }

    async ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle$ = this.shuttlesService.getShuttle(shuttleId);
        combineLatest([
            this.shuttlesService.getShuttle(shuttleId),
            this.ratingsService.userRatings])
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([shuttle, userRatings]) => {
                if (shuttle) {
                    this.userRating = userRatings.find((rating: Rating) => rating.shuttleId === shuttle._id);
                    if (this.userRating) {
                        this.ratingForm = {...this.userRating};
                        this.alreadyRatedByUser = true;
                    }
                }
            });
    }


    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    async rateClicked(shuttle: Shuttle) {

        const totalAvg = (this.ratingForm.service
            + this.ratingForm.reliabilityAndPunctuality
            + this.ratingForm.drivingStyleAndSecurity
            + this.ratingForm.price) / 4;

        const userId = await this.authService.getUserId();
        const rating: Rating = {
            _id: `${shuttle._id}--${DocType.Rating}--${userId}`,
            userId: userId,
            shuttleId: shuttle._id,
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
            if (!RatePage.ratingFormsEqual(this.userRating, rating)) {
                this.ratingsService.updateRating(rating);
            }
        } else {
            this.ratingsService.putRating(rating);
        }
        this.navCtrl.pop();
    }

    public deleteClicked() {
        this.deleteRatingAlert();
    }


    /* Alerts */
    async deleteRatingAlert() {
        const alert = await this.alertCtrl.create({
            header: '',
            subHeader: this.translate.instant('rate.msg.DELETE_RATING'),
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
