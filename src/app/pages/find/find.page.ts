import {Component, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {GeoService} from '../../services/geo/geo.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {District} from '../../models/district';
import {ENV} from '@env';
import {Shuttle} from '../../models/shuttle';
import {Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {DistrictsService} from '../../services/districts/districts.service';

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss'],
    providers: [CallNumber],
})
export class FindPage implements OnInit {
    calledShuttle: any;
    districtsAvailable: boolean;

    private allDistricts: District[];
    recentDistricts: District[];
    remainingDistricts: District[];
    favorites: any[];

    lang: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private http: HttpClientModule,
                private callNumber: CallNumber,
                private toastCtrl: ToastController,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private districtsService: DistrictsService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private geo: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
        this.allDistricts = [];
        this.recentDistricts = [];
        this.remainingDistricts = [];
        this.favorites = [];
    }

    async ngOnInit(): Promise<void> {
        console.log(ENV.message);
        this.lang = await this.localData.getLang();
        this.districtsService.getDistricts().subscribe((data) => {
            this.allDistricts = data.rows.map(row => {
                return row.doc;
            });
        });
        // this.fetchDistricts();
        // this.fetchFavorites();
    }

    private async ionViewWillEnter() {
        // this.updateDistricts();
        // this.fetchFavorites();
    }

    private async fetchDistricts() {
        this.allDistricts = await this.sfDb.getDistricts();
        this.updateDistricts();
    }

    private async updateDistricts() {
        this.recentDistricts = await this.localData.getRecentDistricts();
        this.remainingDistricts = this.allDistricts.slice();
        this.recentDistricts.forEach((d) => {
            const index = this.remainingDistricts.findIndex((t) => t._id === d._id);
            if (index > -1) {
                this.remainingDistricts.splice(index, 1);
            }
        });
    }

    private async fetchFavorites() {
        this.favorites = await this.localData.getFavorites();
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

    getDistrictStyle(district: District) {
        if (district) {
            const colors = this.colorGenerator.getDistrictColors(district);
            return {
                'background': colors[0],
                'color': colors[0]
            };
        }
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

    getDistrictColors(district: District) {
        if (district) {
            return this.colorGenerator.getDistrictColors(district);
        }
    }

    //
    // private async toSelectionPage(district) {
    //     if (this.localData.inDirectMode()) {
    //         const shuttlesByDistrict = await this.sfDb.getShuttlesByDistrict(district);
    //         const shuttles = await this.sfDb.getMergedShuttles(shuttlesByDistrict);
    //
    //         // this.navCtrl.push('Call', {shuttles: shuttles, district: district});
    //     } else {
    //         // this.navCtrl.push('Selection', {
    //         //     district: district,
    //         //     districtColors: this.colorGenerator.getDistrictColors(district)
    //         // });
    //     }
    //     this.localData.setRecentDistricts(district);
    // }

    public async gpsClicked() {
        // //Device testing
        // if (this.util.isDevice()) {
        //     const locationAuthorized: boolean = await this.diagnostic.isLocationAuthorized();
        //     if (!locationAuthorized) {
        //         await this.diagnostic.requestLocationAuthorization();
        //     }
        //     const locationEnabled = await this.diagnostic.isLocationEnabled();
        //     if (!locationEnabled) {
        //         this.presentEnableGpsAlert();
        //     } else {
        //         // Direct Mode
        //         if (this.localData.inDirectMode()) {
        //             const pos = await this.geo.getPosition();
        //
        //             let shuttlesTemp = await this.sfDb.getShuttlesFromLocation(pos, 25000);
        //             if (shuttlesTemp.length < 3) {
        //                 shuttlesTemp = await this.sfDb.getShuttlesFromLocation(pos, 30000);
        //             }
        //             if (shuttlesTemp.length < 1) {
        //                 this.presentNoShuttleFoundToast();
        //             } else {
        //                 const shuttles = await this.sfDb.getMergedShuttles(shuttlesTemp);
        //                 console.log(shuttles);
        //                 // this.navCtrl.push('Call', {shuttles: shuttles});
        //             }
        //             // Standard Mode
        //         } else {
        //             // this.navCtrl.push('Selection', {viaGps: true});
        //         }
        //     }
        //     // Browser testing
        // } else {
        //     if (this.localData.inDirectMode()) {
        //         const shuttlesTemp = await this.sfDb.getShuttlesFromLocation(
        //             this.geo.getRandomPosition(), 25000);
        //         const shuttles = await this.sfDb.getMergedShuttles(shuttlesTemp);
        //         // this.navCtrl.push("Call", {shuttles: shuttles});
        //
        //     } else {
        //         // this.navCtrl.push("Selection", {viaGps: true});
        //     }
        // }
        this.navCtrl.navigateForward('/tabs/find/gps/46.4983,11.3548');
    }

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

}

