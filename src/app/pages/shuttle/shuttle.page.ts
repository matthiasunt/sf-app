import {Component, OnInit} from '@angular/core';
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

@Component({
    selector: 'app-shuttle',
    templateUrl: './shuttle.page.html',
    styleUrls: ['./shuttle.page.scss'],
    providers: [CallNumber],
})
export class ShuttlePage implements OnInit {

    shuttle: Shuttle;
    shuttleColor: string;
    isFavorite: boolean;
    lang: string;

    constructor(private navCtrl: NavController,
                private toastController: ToastController,
                private popoverController: PopoverController,
                private geoService: GeoService,
                private callNumber: CallNumber,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private authService: AuthService,
                private localData: LocalDataService,
                private listsService: ListsService,
                private shuttlesService: ShuttlesService,
                public callsService: CallsService,
                private colorGenerator: ColorGeneratorService,
    ) {
        this.shuttleColor = '#99CC33';
        this.isFavorite = false;
    }

    async ngOnInit() {
        this.lang = await this.localData.getLang();
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        console.log(this.router.url);
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.isFavorite = this.listsService.favorites.getValue()
            .findIndex((e: ListElement) => e.shuttleId === this.shuttle._id) > -1;


    }

    public callClicked() {
        this.callsService.handleCall(this.shuttle._id, {
            name: CallOriginName.District,
            value: '',
        });
        this.callNumber.callNumber(this.shuttle.phone, true);
    }

    public rateClicked() {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + this.shuttle._id);
    }

    public toRatingsPage() {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/ratings/' + this.shuttle._id);
    }

    public addToFavorites() {
        const type = ElementType.Favorite;
        const listElement: ListElement = {
            _id: `${this.authService.getUserId()}-${type}-${this.shuttle._id}`,
            userId: this.authService.getUserId(),
            shuttleId: this.shuttle._id,
            date: new Date().toISOString(),
            type: type
        };
        this.listsService.addListElement(listElement);
        this.isFavorite = true;
        this.presentAddedToFavoritesToast();
    }

    private async presentAddedToFavoritesToast() {
        const toast = await this.toastController.create({
            message: 'Shuttle added to Favorites!',
            showCloseButton: true,
            closeButtonText: 'Ok',
            position: 'top',
            duration: 2000,
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
            message: 'Shuttle removed from Favorites!',
            showCloseButton: true,
            closeButtonText: 'Ok',
            position: 'top',
            duration: 2000,
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
