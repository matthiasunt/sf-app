import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {GeoService} from '../../services/geo/geo.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {District} from '../../models/district';
import {ENV} from '@env';

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss']
})
export class FindPage {
    calledShuttle: any;
    districtsAvailable: boolean;

    districts: District[];
    private favorites: any[];

    constructor(
        private navCtrl: NavController,
        private http: HttpClientModule,
        private router: Router,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private sfDb: SfDbService,
        private localData: LocalDataService,
        private geo: GeoService,
        private colorGenerator: ColorGeneratorService,
    ) {
        console.log(ENV.message);
        this.fetchDistricts();
        this.fetchFavorites();
    }

    private async fetchDistricts() {
        const tempDistricts = await this.sfDb.getDistricts();
        const recentDistricts = await this.localData.getRecentlyUsedDistricts();
        recentDistricts.forEach((d) => {
            let index = -1;
            for (let j = 0; j < tempDistricts.length; j++) {
                if (tempDistricts[j]._id === d._id) {
                    index = j;
                }
            }
            if (index > -1) {
                tempDistricts.splice(index, 1);
            }
        });
        this.districts = recentDistricts.concat(tempDistricts);
    }

    private async fetchFavorites() {
        this.favorites = await this.localData.getFavorites();
    }

    private async districtClicked(district) {
        if (this.localData.inDirectMode()) {
            const shuttlesByDistrict = await this.sfDb.getShuttlesByDistrict(district);
            const shuttles = await this.sfDb.getMergedShuttles(shuttlesByDistrict);
            // this.navCtrl.push("Call", {
            //   shuttles: shuttles,
            //   district: district
            // });
        } else {
            this.router.navigate(['/tabs/find/selection/' + district._id]);
        }
        this.localData.setRecentlyUsedDistrict(district);
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
    //     this.localData.setRecentlyUsedDistrict(district);
    // }

    public async gpsClicked() {
        //
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


    private toDeparturePage(event) {
        // this.navCtrl.push('Departure');
    }


    private getDistrictName(district: any): string {
        if (district.name
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

}

