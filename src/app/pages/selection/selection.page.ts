import {Component, OnInit} from '@angular/core';
import {LocalDataService} from '../../services/data/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {GeoService} from '../../services/geo/geo.service';
import {AlertController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

import {ActivatedRoute, Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {ShuttlesService} from '../../services/data/shuttles/shuttles.service';
import {DistrictsService} from '../../services/data/districts/districts.service';
import {ListsService} from '../../services/data/lists/lists.service';
import {CallsService} from '../../services/data/calls/calls.service';
import {AuthService} from '../../services/auth/auth.service';
import {CallOrigin, CallOriginName} from '../../models/call';

import {District} from '../../models/district';
import {Shuttle} from '../../models/shuttle';
import {Coordinates} from '../../models/coordinates';

@Component({
    selector: 'app-selection',
    templateUrl: './selection.page.html',
    styleUrls: ['./selection.page.scss'],
    providers: [CallNumber],
})
export class SelectionPage implements OnInit {
    district: District;
    districtColors: string[];

    coordinates: Coordinates;
    currentLocality: string;

    noValidLocalityName: boolean;
    outOfRange: boolean;

    shuttles: Shuttle[];
    lang: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private alertCtrl: AlertController,
                private callNumber: CallNumber,
                private translate: TranslateService,
                private districtsService: DistrictsService,
                private shuttlesService: ShuttlesService,
                private authService: AuthService,
                private callsService: CallsService,
                private listsService: ListsService,
                public localData: LocalDataService,
                private geoService: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
        this.districtColors = ['#99CC33', '#FFFFFF'];

    }

    async ngOnInit() {
        this.lang = await this.localData.getLang();
        const districtId = this.activatedRoute.snapshot.paramMap.get('id');
        // Via District
        if (districtId) {
            this.districtsService.getDistrict(districtId).subscribe((district: District) => {
                this.district = district;
                this.districtColors = this.colorGenerator.getDistrictColors(this.district);
            });
            const shuttlesTemp = this.shuttlesService.getShuttlesByDistrict(districtId);
            this.shuttles = this.shuttlesService.mergeShuttles(shuttlesTemp,
                this.listsService.favorites.getValue(),
                this.listsService.blacklist.getValue()).toArray();
            // Via GPS
        } else {
            const coords = this.activatedRoute.snapshot.paramMap.get('coordinates');
            if (coords) {
                this.coordinates = {
                    latitude: coords.split(',')[0],
                    longitude: coords.split(',')[1],
                };
                this.getShuttlesByPosition();
            }
        }
        this.lang = await this.localData.getLang();
    }

    // TODO: Refactor lang
    private async getShuttlesByPosition() {
        let lang;
        if (this.lang === 'it') {
            lang = 'it';
        } else {
            lang = 'de';
        }
        this.currentLocality = await this.geoService.getLocalityName(this.coordinates, lang);
        if (!this.currentLocality || this.currentLocality.length < 1) {
            this.noValidLocalityName = true;
        }
        let shuttlesTemp = await this.shuttlesService.getShuttlesFromPosition(this.coordinates, 22000);
        if (shuttlesTemp.count() < 3) {
            shuttlesTemp = await this.shuttlesService.getShuttlesFromPosition(this.coordinates, 28000);
        }
        if (!shuttlesTemp || shuttlesTemp.count() < 1) {
            this.outOfRange = true;
        } else {
            this.shuttles = shuttlesTemp.toArray();
        }
    }

    public shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
    }

    public callClicked(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        let callOrigin: CallOrigin;
        if (this.district) {
            callOrigin = {
                name: CallOriginName.District,
                value: this.district._id
            };
        } else if (this.coordinates) {
            callOrigin = {
                name: CallOriginName.Gps,
                value: this.coordinates
            };
        }
        this.callsService.handleCall(shuttle._id, callOrigin);
        this.callNumber.callNumber(shuttle.phone, true);
    }

    getToolbarStyle() {
        if (this.districtColors && this.districtColors.length > 0) {
            return {
                'background-color': this.districtColors[0],
                'color': this.districtColors[1]
            };
        }
    }

    // Tool
    public getDistrictName(district: District): string {
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


    public getLocalityName(shuttle: Shuttle): string {
        let ret: string;
        if (shuttle && shuttle.address && shuttle.address.locality) {
            const locality = shuttle.address.locality;
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
