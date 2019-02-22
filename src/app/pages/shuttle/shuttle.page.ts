import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {NavController} from '@ionic/angular';

import {ShuttlesService} from '../../services/data/shuttles/shuttles.service';
import {CallsService} from '../../services/data/calls/calls.service';
import {ListsService} from '../../services/data/lists/lists.service';
import {AuthService} from '../../services/auth/auth.service';
import {LocalDataService} from '../../services/data/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';

import {Shuttle} from '../../models/shuttle';
import {CallOriginName} from '../../models/call';
import {ElementType, ListElement} from '../../models/list-element';
import {getContrastColor, getFormattedPhoneNumber} from '../../tools/sf-tools';

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

    constructor(private navCtrl: NavController,
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
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        console.log(this.router.url);
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.isFavorite = this.listsService.favorites.getValue()
            .findIndex((e: ListElement) => e.shuttleId === this.shuttle._id) > -1;


    }

    public callClicked(shuttle: Shuttle) {
        this.callsService.handleCall(shuttle._id, {
            name: CallOriginName.District,
            value: '',
        });
        this.callNumber.callNumber(shuttle.phone, true);
    }

    public rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + shuttle._id);
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
    }

    public removeFromFravorites() {
        this.listsService.removeListElementByShuttleId(this.shuttle._id,
            this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted);
        this.isFavorite = false;
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

    public async getLocalityName(): Promise<string> {
        if (this.shuttle && this.shuttle.address && this.shuttle.address.locality) {
            const locality = this.shuttle.address.locality;
            switch (await this.localData.getLang()) {
                case 'de_st':
                    return locality.de;
                case 'it':
                    return locality.it;
                default:
                    return locality.de;
            }

        }
    }

}
