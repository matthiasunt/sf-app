import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {NavController} from '@ionic/angular';
import {ShuttlesService} from '../../services/shuttles/shuttles.service';
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
                private localData: LocalDataService,
                private shuttlesService: ShuttlesService,
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
        this.isFavorite = this.localData.isFavorite(shuttleId);


    }

    callClicked(shuttle: Shuttle) {
        this.localData.addShuttleToHistory(shuttle);
        this.callNumber.callNumber(shuttle.phone, true);
    }

    rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + shuttle._id);
    }

    addToFavorites() {

    }

    removeFromFravorites() {

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

}
