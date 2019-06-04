import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {NavController, PopoverController, ToastController} from '@ionic/angular';

import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {CallsService} from '@services/data/calls/calls.service';
import {ListsService} from '@services/data/lists/lists.service';
import {AuthService} from '@services/auth/auth.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';

import {Shuttle} from '@models/shuttle';
import {CallOrigin, CallOriginName} from '@models/call';
import {ElementType, ListElement} from '@models/list-element';
import {GeoService} from '@services/geo/geo.service';
import {Rating} from '@models/rating';
import {RatingsService} from '@services/data/ratings/ratings.service';
import {TranslateService} from '@ngx-translate/core';
import {combineLatest, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {District} from '@models/district';
import {DistrictsService} from '@services/data/districts/districts.service';

@Component({
    selector: 'app-shuttle',
    templateUrl: './shuttle.page.html',
    styleUrls: ['./shuttle.page.scss'],
    providers: [CallNumber],
})
export class ShuttlePage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();

    shuttle: Shuttle;
    isFavorite: boolean;
    lang: string;

    shuttleDistricts: District[];

    userRating: Rating;
    reviewsToDisplay: string[];
    ratingsFromShuttle: Rating[];

    constructor(private zone: NgZone,
                private navCtrl: NavController,
                public translate: TranslateService,
                private toastController: ToastController,
                private popoverController: PopoverController,
                private geoService: GeoService,
                private callNumber: CallNumber,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private authService: AuthService,
                private localDataService: LocalDataService,
                private listsService: ListsService,
                private shuttlesService: ShuttlesService,
                private districtsService: DistrictsService,
                public callsService: CallsService,
                private ratingsService: RatingsService,
    ) {
        this.isFavorite = false;
        this.ratingsFromShuttle = [];
        this.reviewsToDisplay = [];
    }

    async ngOnInit() {
        this.localDataService.lang
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((lang: string) => this.lang = lang);

        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');

        combineLatest(
            this.shuttlesService.getShuttle(shuttleId),
            this.ratingsService.userRatings,
            this.listsService.favorites,
            this.districtsService.districts
        ).pipe(takeUntil(this.unsubscribe$))
            .subscribe(([shuttle, ratings, favorites, districts]) => {
                this.zone.run(() => {
                    this.shuttle = shuttle;

                    // Districts
                    this.shuttleDistricts = districts.filter(d =>
                        this.shuttle.districtIds.indexOf(d._id) > -1).toArray();

                    // Reviews
                    if (this.shuttle && this.shuttle.avgRating && this.shuttle.avgRating.reviews) {
                        this.reviewsToDisplay = this.shuttle.avgRating.reviews;
                        this.reviewsToDisplay.slice(0, 1);
                    }

                    // User Rating
                    this.userRating = ratings.find((rating) => rating.shuttleId === this.shuttle._id);

                    // Is Shuttle Favorite?
                    this.isFavorite = favorites.findIndex((e: ListElement) => e.shuttleId === shuttleId) > -1;
                });
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public async callClicked() {
        const callOrigin = await this.getCallOrigin();
        this.callsService.setCallHandlerData(this.shuttle._id, callOrigin);
        this.callNumber.callNumber(this.shuttle.phone, true);
        this.localDataService.addToHistory({shuttle: this.shuttle, date: new Date()});
    }

    public rateClicked() {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + this.shuttle._id);
    }

    public toRatingsPage() {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/ratings/' + this.shuttle._id);
    }

    public async addToFavorites() {
        const userId = await this.authService.getUserId();
        const listElement: ListElement = {
            _id: `${userId}--${ElementType.Favorite}--${this.shuttle._id}`,
            userId: userId,
            shuttleId: this.shuttle._id,
            date: new Date().toISOString(),
            type: ElementType.Favorite
        };
        this.listsService.addListElement(listElement);
        this.isFavorite = true;
        this.presentAddedToFavoritesToast();
    }

    /* Toasts & Alerts */
    private async presentAddedToFavoritesToast() {
        const toast = await this.toastController.create({
            message: this.translate.instant('shuttle.SHUTTLE_ADDED_TO_FAVORITES'),
            showCloseButton: true,
            closeButtonText: 'Ok',
            position: 'bottom',
            duration: 1700,
            color: 'secondary',
        });
        toast.present();
    }

    public removeFromFravorites() {
        this.listsService.removeListElementByShuttleId(this.shuttle._id,
            this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted);
        this.isFavorite = false;
        this.presentRemovedFromFavoritesToast();
    }

    private async presentRemovedFromFavoritesToast() {
        const toast = await this.toastController.create({
            message: this.translate.instant('shuttle.SHUTTLE_REMOVED_FROM_FAVORITES'),
            showCloseButton: true,
            closeButtonText: 'Ok',
            position: 'bottom',
            duration: 1700,
            color: 'danger',
        });
        toast.present();
    }

    private async getCallOrigin(): Promise<CallOrigin> {
        let callOrigin: CallOrigin;
        const url: string[] = this.router.url.split('/');
        if (url.includes('history')) {
            callOrigin = {name: CallOriginName.History, value: ''};
        } else if (url.includes('district')) {
            callOrigin = {
                name: CallOriginName.District,
                value: url[url.indexOf('district') + 1]
            };
        } else if (url.includes('gps')) {
            callOrigin = {
                name: CallOriginName.Gps,
                value: await this.geoService.getCurrentPosition()
            };
        } else if (url.includes('find') && url.indexOf('find') === url.indexOf('shuttle') - 1) {
            console.log('Favorite');
            callOrigin = {name: CallOriginName.Favorite, value: ''};
        } else {
            callOrigin = {name: CallOriginName.Other, value: this.router.url};
        }
        return callOrigin;
    }

}
