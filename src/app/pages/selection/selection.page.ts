import {Component, NgZone, OnInit} from '@angular/core';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {GeoService} from '@services/geo/geo.service';
import {AlertController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {ActivatedRoute, Router} from '@angular/router';

import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {DistrictsService} from '@services/data/districts/districts.service';
import {ListsService} from '@services/data/lists/lists.service';
import {CallsService} from '@services/data/calls/calls.service';
import {AuthService} from '@services/auth/auth.service';

import {CallOrigin, CallOriginName} from '@models/call';
import {District} from '@models/district';
import {Shuttle} from '@models/shuttle';
import {Coordinates} from '@models/coordinates';
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

    coordinates: Coordinates;
    currentLocality: string;

    noValidLocalityName: boolean;
    outOfRange: boolean;

    shuttles: Shuttle[] = [];
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
                public localDataService: LocalDataService,
                private geoService: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
        this.districtColors = ['#99CC33', '#FFFFFF'];

    }

    async ngOnInit() {
        this.lang = await this.localDataService.getLang();
        const districtId = this.activatedRoute.snapshot.paramMap.get('id');
        if (districtId) {
            this.fetchShuttlesByDistrict(districtId);
        } else {
            this.coordinates = await this.geoService.getCurrentPosition();
            this.fetchShuttlesByPosition();
        }
    }

    private fetchShuttlesByDistrict(districtId: string) {
        this.districtsService.getDistrict(districtId).subscribe((district: District) => {
            this.district = district;
            this.districtColors = this.colorGenerator.getDistrictColors(this.district);
            this.shuttlesService.allShuttles.subscribe((allShuttles) => {
                let shuttles: List<Shuttle> = allShuttles.filter((shuttle: Shuttle) => {
                    return shuttle.districtIds.indexOf(districtId) > -1;
                }).toList();
                shuttles = this.shuttlesService.rankShuttlesByScore(shuttles);
                this.shuttles = this.shuttlesService.mergeShuttles(shuttles,
                    this.listsService.favorites.getValue(),
                    this.listsService.blacklist.getValue()).toArray();
            });
        });
    }

    private async fetchShuttlesByPosition() {
        const lang = this.lang === 'it' ? 'it' : 'de';
        this.shuttlesService.allShuttles.subscribe((allShuttles) => {
            let shuttles = this.shuttlesService.filterShuttlesByPosition(allShuttles.toList(), this.coordinates, 22000);
            if (shuttles.count() < 3) {
                shuttles = this.shuttlesService.filterShuttlesByPosition(allShuttles.toList(), this.coordinates, 27000);
            }
            if (!shuttles || shuttles.count() < 1) {
                this.outOfRange = true;
            } else {
                this.shuttles = this.shuttlesService.mergeShuttles(shuttles,
                    this.listsService.favorites.getValue(),
                    this.listsService.blacklist.getValue()).toArray();
            }
        });
        this.currentLocality = await this.geoService.getLocalityName(this.coordinates, lang);
        if (!this.currentLocality || this.currentLocality.length < 1) {
            this.noValidLocalityName = true;
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
        this.callsService.setCallHandlerData(shuttle._id, callOrigin);
        this.callNumber.callNumber(shuttle.phone, true);
        this.localDataService.addToHistory({shuttle, date: new Date()});
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
