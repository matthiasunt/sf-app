import {Component, OnInit} from '@angular/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {GeoService} from '../../services/geo/geo.service';
import {AlertController, NavController} from '@ionic/angular';
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
    district: District;
    districtColors: string[];

    pos: any;
    actualCity: string;
    noValidCityName: boolean;

    coordinates: any;

    outOfRange: boolean;
    queryResult: any[];

    shuttles: Shuttle[];
    lang: string;
    shuttlesInRanges: any;

    actualShuttleIndex: number;

    constructor(private activatedRoute: ActivatedRoute,
                private alertCtrl: AlertController,
                private router: Router,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private geo: GeoService,
                private colorGenerator: ColorGeneratorService,
    ) {

    }

    async ngOnInit() {
        this.districtColors = ['#99CC33', '#FFFFFF'];
        const districtId = this.activatedRoute.snapshot.paramMap.get('id');
        // Via District
        if (districtId) {
            this.district = await this.sfDb.getDistrict(districtId);
            this.districtColors = this.colorGenerator.getDistrictColors(this.district);
            this.getShuttlesByDistrict(this.district);
            // Via GPS
        } else {
            const coords = this.activatedRoute.snapshot.paramMap.get('coordinates');
            if (coords) {
                this.coordinates = {
                    lat: coords.split(',')[0],
                    lng: coords.split(',')[1],
                };
                this.getShuttlesByCoords();
            }
        }
        this.lang = await this.localData.getLang();
    }

    getToolbarStyle() {
        return {
            'background-color': this.districtColors[0],
            'color': this.districtColors[1]
        };
    }


    private async getShuttlesByDistrict(d: District) {
        const shuttlesByDistrict = await this.sfDb.getShuttlesByDistrict(this.district);
        this.shuttles = await this.sfDb.getMergedShuttles(shuttlesByDistrict);
    }

    private async getShuttlesByCoords() {
        let l;
        switch (this.lang) {
            case 'it':
                l = 'it';
                break;
            default:
                l = 'de';
        }

        // this.actualPos = this.util.isDevice() ? await this.geo.getPosition() : this.geo.getRandomPosition();
        this.pos = this.geo.getRandomPosition();

        let shuttlesTemp = await this.sfDb.getShuttlesFromLocation(this.pos, 25000);
        if (shuttlesTemp.length < 3) {
            shuttlesTemp = await this.sfDb.getShuttlesFromLocation(this.pos, 30000);
        }
        if (!shuttlesTemp || shuttlesTemp.length < 1) {
            this.outOfRange = true;
        } else {
            this.shuttles = await this.sfDb.getMergedShuttles(shuttlesTemp);
        }
        this.actualCity = await this.geo.getGeocodedCityName(this.pos, l);

        if (!this.actualCity || this.actualCity.length < 2) {
            this.noValidCityName = true;
        }
    }

    private shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.localData.addShuttleToHistory(shuttle);
        this.router.navigate([currentUrl + '/shuttle/' + shuttle._id]);
        // if (this.util.isAndroid() && this.localData.getNumberOfCalls() == 0) {
        //   this.presentReallyCallToast(shuttle);
        // }
        // else {
        //   this.toCallPage(shuttle);
        // }
    }

    private callClicked(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
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
                    }
                }
            ]
        });
        await alert.present();
    }

    // Tool
    private async getDistrictName(district: any): Promise<string> {
        if (
            district &&
            district.name
            && district.name.de
            && district.name.it
            && district.name.de_st) {
            switch (this.lang) {
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
            switch (this.lang) {
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
