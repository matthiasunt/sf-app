import {Component, OnInit} from '@angular/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {GeoService} from '../../services/geo/geo.service';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {District} from '../../models/district';
import {Shuttle} from '../../models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-selection',
    templateUrl: './selection.page.html',
    styleUrls: ['./selection.page.scss'],
})
export class SelectionPage implements OnInit {
    private district: District;
    private districtColors: string[];

    private viaGPS: boolean;
    private actualPos: any;
    private actualCity: string;
    private noValidCityName: boolean;

    private outOfRange: boolean;
    private showAllShuttles: boolean;
    private queryResult: any[];

    private shuttles: Shuttle[];
    private shuttlesInRanges: any;

    private actualShuttleIndex: number;

    constructor(public alertCtrl: AlertController,
                private route: ActivatedRoute,
                private router: Router,
                public translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private geo: GeoService,
                private colorGenerator: ColorGeneratorService,
    ) {
        // this.district = navParams.get('district');
        // this.districtColors = navParams.get('districtColors');
        if (!this.districtColors) {
            this.districtColors = ['#99CC33', '#FFFFFF'];
        }
        // this.showAllShuttles = navParams.get('showAllShuttles');
        // this.viaGPS = navParams.get('viaGps');

        // Via specific district

    }

    async ngOnInit() {
        const districtId = this.route.snapshot.paramMap.get('id');
        this.district = await this.sfDb.getDistrict(districtId);
        this.districtColors = this.colorGenerator.getDistrictColors(this.district);
        if (this.district) {
            this.fetchShuttlesByDistrict(this.district);
        } else if (this.showAllShuttles) {
            this.getAllShuttles();
        } else if (this.viaGPS) {
            this.getShuttlesViaGps();
        }
    }

    setToolbarStyle() {
        return {
            'background-color': this.districtColors[0],
            'color': this.districtColors[1]
        };
    }


    private async fetchShuttlesByDistrict(d: District) {
        const shuttlesByDistrict = await this.sfDb.getShuttlesByDistrict(this.district);
        this.shuttles = await this.sfDb.getMergedShuttles(shuttlesByDistrict);
    }

    private async getAllShuttles() {
        const allShuttles = await this.sfDb.getAllShuttles();
        this.shuttles = await this.sfDb.getMergedShuttles(allShuttles);
    }

    private async getShuttlesViaGps() {
        let lang: string;
        switch (this.localData.getPrefLang()) {
            case 'it':
                lang = 'it';
                break;
            default:
                lang = 'de';
        }

        // this.actualPos = this.util.isDevice() ? await this.geo.getPosition() : this.geo.getRandomPosition();
        this.actualPos = this.geo.getRandomPosition();

        let shuttlesTemp = await this.sfDb.getShuttlesFromLocation(this.actualPos, 25000);
        if (shuttlesTemp.length < 3) {
            shuttlesTemp = await this.sfDb.getShuttlesFromLocation(this.actualPos, 30000);
        }
        if (!shuttlesTemp || shuttlesTemp.length < 1) {
            this.outOfRange = true;
        } else {
            this.shuttles = await this.sfDb.getMergedShuttles(shuttlesTemp);
        }
        this.actualCity = await this.geo.getGeocodedCityName(this.actualPos, lang);

        if (!this.actualCity) {
            console.log(this.actualCity);
            this.noValidCityName = true;
        }
    }

    private itemClicked(shuttle: Shuttle) {
        // if (this.util.isAndroid() && this.localData.getNumberOfCalls() == 0) {
        //   this.presentReallyCallToast(shuttle);
        // }
        // else {
        //   this.toCallPage(shuttle);
        // }
    }


    private async presentReallyCallToast(shuttle) {
        const alert = await this.alertCtrl.create({
            header: '',
            subHeader: this.translate.instant('selection.REALLY_CALL_1')
                + ' <b color=\'#8BC34A\'>' + shuttle.name + '</b>'
                + this.translate.instant('selection.REALLY_CALL_2'),
            buttons: [
                {text: this.translate.instant('NO')},
                {
                    text: this.translate.instant('YES'),
                    handler: () => {
                        this.toCallPage(shuttle);
                    }
                }
            ]
        });
        await alert.present();
    }

    private toDetailPage(shuttle: Shuttle) {
        // this.navCtrl.push('ShuttleDetail', {
        //   shuttle: shuttle,
        //   district: this.district
        // });
    }

    private toCallPage(shuttle: Shuttle) {
        // this.navCtrl.push('Call', {
        //   shuttle: shuttle, district: this.district
        // });
    }

    // Tool
    private getDistrictName(district: any): string {
        if (
            district &&
            district.name
            && district.name.de
            && district.name.it
            && district.name.de_st) {
            switch (this.localData.getPrefLang()) {
                case 'de_st':
                    return district.name.de_st;
                case 'it':
                    return district.name.it;
                default:
                    return district.name.de;
            }
        } else {
            console.log('Error getting district name');
        }
    }


    private getCityName(shuttle: Shuttle): string {
        if (shuttle &&
            shuttle.city
            && shuttle.city.de && shuttle.city.it) {
            switch (this.localData.getPrefLang()) {
                case 'de_st':
                    return this.geo.getBeatifulCityName(shuttle.city.de);
                case 'it':
                    return this.geo.getBeatifulCityName(shuttle.city.it);
                default:
                    return this.geo.getBeatifulCityName(shuttle.city.de);
            }
        }
    }

}
