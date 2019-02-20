import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {NavController} from '@ionic/angular';
import {ShuttlesService} from '../../services/shuttles/shuttles.service';
import {getContrastColor, getFormattedPhoneNumber} from '../../tools/sf-tools';
import {CallsService} from '../../services/calls/calls.service';
import {ElementType, ListElement} from '../../models/list-element';
import {ListsService} from '../../services/lists/lists.service';

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
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        this.shuttle = this.shuttle;
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
        this.isFavorite = this.listsService.favorites.getValue().find


    }

    callClicked(shuttle: Shuttle) {
        // this.localData.addShuttleToHistory(shuttle);
        this.callNumber.callNumber(shuttle.phone, true);
    }

    rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + shuttle._id);
    }

    addToFavorites() {
        const listElement: ListElement = {
            _id: `abc-${this.shuttle._id}`,
            userId: 'abc',
            shuttleId: this.shuttle._id,
            date: new Date().toISOString(),
            type: ElementType.Favorite
        };
        this.listsService.addListElement(listElement);
    }

    removeFromFravorites() {
        this.listsService.removeListElementByShuttleId(this.shuttle._id,
            this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted);
    }

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColor,
            'color': getContrastColor(this.shuttleColor)
        };
    }

    private getPhoneNumber(shuttle: Shuttle) {
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
