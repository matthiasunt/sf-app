import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {LocalDataService} from '../../services/data/local-data/local-data.service';
import {GeoService} from '../../services/geo/geo.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {District} from '../../models/district';
import {ENV} from '@env';
import {Shuttle} from '../../models/shuttle';
import {Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {DistrictsService} from '../../services/data/districts/districts.service';
import {getContrastColor} from '../../tools/sf-tools';
import {ShuttlesService} from '../../services/data/shuttles/shuttles.service';
import {ListsService} from '../../services/data/lists/lists.service';
import {DeviceService} from '../../services/device/device.service';

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss'],
    providers: [CallNumber],
})
export class FindPage implements OnInit {

    private allDistricts;
    recentDistricts: District[];
    remainingDistricts: District[];
    favorites: any[];

    lang: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private http: HttpClientModule,
                private diagnostic: Diagnostic,
                private deviceService: DeviceService,
                private callNumber: CallNumber,
                private toastCtrl: ToastController,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                public districtsService: DistrictsService,
                private shuttlesService: ShuttlesService,
                public listsService: ListsService,
                private localData: LocalDataService,
                private geoService: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
        this.allDistricts = [];
        this.recentDistricts = [];
        this.remainingDistricts = [];
        this.favorites = [];
    }

    async ngOnInit(): Promise<void> {
        console.log(ENV.message);
        this.allDistricts = this.districtsService.districts.subscribe((districts) => {
            this.allDistricts = districts.toArray();
        });
        this.localData.getLang().then((lang) => {
            this.lang = lang;
        });
    }

    private async ionViewWillEnter() {
        this.updateDistricts();
    }

    private async updateDistricts() {
        this.recentDistricts = await this.localData.getRecentDistricts();
        if (this.allDistricts && this.allDistricts.length > 0) {
            this.remainingDistricts = this.allDistricts.slice();
            this.recentDistricts.forEach((d) => {
                const index = this.remainingDistricts.findIndex((t) => t._id === d._id);
                if (index > -1) {
                    this.remainingDistricts.splice(index, 1);
                }
            });
        }
    }

    public async gpsClicked() {
        // Device testing
        if (this.deviceService.isDevice()) {
            const locationAuthorized: boolean = await this.diagnostic.isLocationAuthorized();
            if (!locationAuthorized) {
                await this.diagnostic.requestLocationAuthorization();
            }
            const locationEnabled = await this.diagnostic.isLocationEnabled();
            if (!locationEnabled) {
                this.presentEnableGpsAlert();
            } else {
                const position = await this.geoService.getCurrentPosition();
                this.navCtrl.navigateForward(`/tabs/find/gps/${position.latitude},${position.longitude}`);
            }
            // Browser testing
        } else {
            const position = await this.geoService.getCurrentPosition();
            this.navCtrl.navigateForward(`/tabs/find/gps/${position.latitude},${position.longitude}`);
        }

    }


    private async districtClicked(district) {
        if (this.localData.getDirectMode()) {
            // const shuttlesByDistrict = await this.sfDb.getShuttlesByDistrict(district);
            // const shuttles = await this.sfDb.getMergedShuttles(shuttlesByDistrict);
        } else {
            this.navCtrl.navigateForward('/tabs/find/district/' + district._id);
        }
        this.localData.setRecentDistricts(district);
    }

    public shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
    }

    public getDistrictColors(district: District) {
        if (district) {
            return this.colorGenerator.getDistrictColors(district);
        }
    }

    /* Alerts */
    private async presentEnableGpsAlert() {
        const alert = await this.alertCtrl.create({
            header: this.translate.instant('departure.msg.ENABLE_GPS'),
            buttons: [
                {text: this.translate.instant('CANCEL')},
                {
                    text: this.translate.instant('OK'),
                    handler: () => {
                        // this.diagnostic.switchToLocationSettings();
                    }
                }
            ]
        });
        await alert.present();
    }

    /* Toasts */
    private async presentConnectionToast() {
        const toast = await this.toastCtrl.create({
            message: this.translate.instant('VERIFY_CONNECTION'),
            showCloseButton: true,
            closeButtonText: this.translate.instant('OK'),
            position: 'bottom'
        });
        await toast.present();
    }


    private async presentNoShuttleFoundToast() {
        const toast = await this.toastCtrl.create({
            message: this.translate.instant('NO_SHUTTLE_FOUND'),
            showCloseButton: true,
            closeButtonText: this.translate.instant('OK'),
            position: 'bottom'
        });
        await toast.present();
    }

    private getTMMUrl() {
        if (this.translate.currentLang === 'it') {
            return 'http://bit.ly/zero-compromessi';
        } else {
            return 'http://bit.ly/keine-kompromisse';
        }
    }


    private getDistrictName(district: any): string {
        if (district && district.name && district.name.de && district.name.it && district.name.de_st) {
            switch (this.lang) {
                case 'de_st':
                    return district.name.de_st;
                case 'it':
                    return district.name.it;
                default:
                    return district.name.de;
            }
        }
    }

    getContrastColor(shuttleColor: string) {
        return getContrastColor(shuttleColor);
    }
}

