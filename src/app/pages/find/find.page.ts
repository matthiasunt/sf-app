import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';

import {DistrictsService} from '@services/data/districts/districts.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {DeviceService} from '@services/device/device.service';
import {District} from '@models/district';
import {Shuttle} from '@models/shuttle';
import {ENV} from '@env';
import {Districts} from '../../../assets/data/districts';
import {Subject} from 'rxjs';
import {AuthService} from '@services/auth/auth.service';

import {PermissionResult, PermissionType, Plugins} from '@capacitor/core';

const {Permissions} = Plugins;

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss'],
    providers: [CallNumber],
})
export class FindPage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();

    public lang: string;
    public districts: District[] = Districts;

    public devMessage: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private http: HttpClientModule,
                private deviceService: DeviceService,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private authService: AuthService,
                public districtsService: DistrictsService,
                public localDataService: LocalDataService,
    ) {
    }

    async ngOnInit() {
        this.localDataService.lang.subscribe((lang: string) => this.lang = lang);

        console.log(ENV.message);

        if (!ENV.production) {
            this.devMessage = `Hey, ${await this.authService.getUserId()}`;
        }
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private async districtClicked(district) {
        this.navCtrl.navigateForward('/tabs/find/district/' + district._id);
    }

    public async gpsClicked() {
        // Device
        if (await this.deviceService.isDevice()) {
            let locationPermissionStatus: PermissionResult = await Permissions.query({name: PermissionType.Geolocation});
            if (locationPermissionStatus.state !== 'granted') {
                // TODO: How to request?
                // await this.diagnostic.requestLocationAuthorization();
            }
            locationPermissionStatus = await Permissions.query({name: PermissionType.Geolocation});
            if (locationPermissionStatus.state !== 'granted') {
                await this.presentEnableGpsAlert();
            } else {
                await this.navCtrl.navigateForward(`/tabs/find/gps`);
            }
            // Browser
        } else {
            await this.navCtrl.navigateForward(`/tabs/find/gps`);
        }

    }

    public shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        await this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
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
}

