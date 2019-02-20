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
import {CallNumber} from '@ionic-native/call-number/ngx';
import {ShuttlesService} from '../../services/shuttles/shuttles.service';
import {DistrictsService} from '../../services/districts/districts.service';
import {ListsService} from '../../services/lists/lists.service';
import {List} from 'immutable';

@Component({
    selector: 'app-selection',
    templateUrl: './selection.page.html',
    styleUrls: ['./selection.page.scss'],
    providers: [CallNumber],
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

    shuttles: List<Shuttle>;
    lang: string;
    shuttlesInRanges: any;

    actualShuttleIndex: number;

    constructor(private navCtrl: NavController,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private alertCtrl: AlertController,
                private callNumber: CallNumber,
                private translate: TranslateService,
                private districtsService: DistrictsService,
                private shuttlesService: ShuttlesService,
                private listsService: ListsService,
                public localData: LocalDataService,
                private geo: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
        this.districtColors = ['#99CC33', '#FFFFFF'];
    }

    async ngOnInit() {
        const districtId = this.activatedRoute.snapshot.paramMap.get('id');
        // Via District
        if (districtId) {
            this.districtsService.getDistrict(districtId).subscribe((district) => {
                this.district = district;
                this.districtColors = this.colorGenerator.getDistrictColors(this.district);
            });
            const shuttlesTemp = this.shuttlesService.getShuttlesByDistrict(districtId);
            this.shuttles = shuttlesTemp;
            // this.shuttles = this.shuttlesService.mergeShuttles(shuttlesTemp,
            //     this.listsService.favorites.getValue(),
            //     this.listsService.blacklist.getValue());
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
        if (this.districtColors && this.districtColors.length > 0) {
            return {
                'background-color': this.districtColors[0],
                'color': this.districtColors[1]
            };
        }
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
        // this.pos = this.geo.getRandomPosition();
        //
        // let shuttlesTemp = await this.shuttlesService.getShuttlesFromLocation(this.pos, 25000);
        // if (shuttlesTemp.length < 3) {
        //     shuttlesTemp = await this.shuttlesService.getShuttlesFromLocation(this.pos, 30000);
        // }
        // if (!shuttlesTemp || shuttlesTemp.length < 1) {
        //     this.outOfRange = true;
        // } else {
        //     this.shuttles = await this.sfDb.getMergedShuttles(shuttlesTemp);
        // }
        // this.actualCity = await this.geo.getGeocodedCityName(this.pos, l);
        //
        // if (!this.actualCity || this.actualCity.length < 2) {
        //     this.noValidCityName = true;
        // }
    }

    private shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
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
        this.localData.addShuttleToHistory(shuttle);
        this.callNumber.callNumber(shuttle.phone, true);
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
    private getDistrictName(district: any): string {
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


    public async getLocalityName(shuttle: Shuttle): Promise<string> {
        if (shuttle && shuttle.address && shuttle.address.locality) {
            const locality = shuttle.address.locality;
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
