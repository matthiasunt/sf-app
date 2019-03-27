import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {NavController, PopoverController, ToastController} from '@ionic/angular';

import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {CallsService} from '@services/data/calls/calls.service';
import {ListsService} from '@services/data/lists/lists.service';
import {AuthService} from '@services/auth/auth.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {ColorGeneratorService} from '@services/color-generator/color-generator.service';

import {Shuttle} from '@models/shuttle';
import {CallOriginName} from '@models/call';
import {ElementType, ListElement} from '@models/list-element';
import {getContrastColor, getFormattedPhoneNumber} from '../../tools/sf-tools';
import {GeoService} from '@services/geo/geo.service';
import {Rating} from '@models/rating';
import {RatingsService} from '@services/data/ratings/ratings.service';
import {TranslateService} from '@ngx-translate/core';
import {List} from 'immutable';
import {Local} from 'protractor/built/driverProviders';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-shuttle',
    templateUrl: './shuttle.page.html',
    styleUrls: ['./shuttle.page.scss'],
    providers: [CallNumber],
})
export class ShuttlePage implements OnInit {

    private unsubscribe$ = new Subject<void>();

    shuttle: Shuttle;
    shuttleColor: string;
    isFavorite: boolean;
    lang: string;

    userRating: Rating;
    ratingsFromShuttle: Rating[];

    constructor(private zone: NgZone,
                private navCtrl: NavController,
                public translate: TranslateService,
                private toastController: ToastController,
                private popoverController: PopoverController,
                private localDataService: LocalDataService,
                private geoService: GeoService,
                private callNumber: CallNumber,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private authService: AuthService,
                private localData: LocalDataService,
                private listsService: ListsService,
                private shuttlesService: ShuttlesService,
                public callsService: CallsService,
                public colorGenerator: ColorGeneratorService,
                private ratingsService: RatingsService,
    ) {
        this.shuttleColor = '#99CC33';
        this.isFavorite = false;
        this.ratingsFromShuttle = [];
    }

    async ngOnInit() {
        console.log('On init');
        this.lang = await this.localData.getLang();
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.isFavorite = this.listsService.favorites.getValue()
            .findIndex((e: ListElement) => e.shuttleId === this.shuttle._id) > -1;
        this.userRating = this.ratingsService.getRatingByUserForShuttle(shuttleId);

        /* Update Shuttle Ratings if Shuttles changed */
        this.shuttlesService.allShuttles
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((allShuttles) => {
                this.zone.run(() => {
                    this.shuttle = allShuttles.get(shuttleId);
                    this.userRating = this.ratingsService.getRatingByUserForShuttle(this.shuttle._id);
                });
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public callClicked() {
        this.callsService.setCallHandlerData(this.shuttle._id, {
            name: CallOriginName.District,
            value: '',
        });
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
            _id: `${userId}-${ElementType.Favorite}-${this.shuttle._id}`,
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
            position: 'top',
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
            position: 'top',
            duration: 1700,
            color: 'danger',
        });
        toast.present();
    }

    getToolbarStyle() {
        return {
            'background-color': this.shuttleColor,
            'color': getContrastColor(this.shuttleColor)
        };
    }

    getPhoneNumber(shuttle: Shuttle) {
        if (shuttle) {
            return getFormattedPhoneNumber(shuttle.phone);
        }
    }

    public getLocalityName(): string {
        let ret: string;
        if (this.shuttle && this.shuttle.address && this.shuttle.address.locality) {
            const locality = this.shuttle.address.locality;
            switch (this.lang) {
                case 'it':
                    ret = locality.it;
                    break;
                default:
                    ret = locality.de;
            }
            return this.geoService.getBeatifulCityName(ret);
        }
    }

}
