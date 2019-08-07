import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';

import {DistrictsService} from '@services/data/districts/districts.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ListsService} from '@services/data/lists/lists.service';
import {DeviceService} from '@services/device/device.service';
import {District} from '@models/district';
import {Shuttle} from '@models/shuttle';
import {ENV} from '@env';
import {Districts} from '../../../assets/data/districts';
import {combineLatest, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthService} from '@services/auth/auth.service';

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

    constructor(private zone: NgZone,
                private navCtrl: NavController,
                private router: Router,
                private http: HttpClientModule,
                private diagnostic: Diagnostic,
                private authService: AuthService,
                private deviceService: DeviceService,
                private callNumber: CallNumber,
                private toastCtrl: ToastController,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                public districtsService: DistrictsService,
                private shuttlesService: ShuttlesService,
                public listsService: ListsService,
                private localDataService: LocalDataService,
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
            const locationAuthorized: boolean = await this.diagnostic.isLocationAuthorized();
            if (!locationAuthorized) {
                await this.diagnostic.requestLocationAuthorization();
            }
            const locationEnabled = await this.diagnostic.isLocationEnabled();
            if (!locationEnabled) {
                this.presentEnableGpsAlert();
            } else {
                this.navCtrl.navigateForward(`/tabs/find/gps`);
            }
            // Browser
        } else {
            this.navCtrl.navigateForward(`/tabs/find/gps`);
        }

    }

    public shuttleClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
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
                        this.diagnostic.switchToLocationSettings();
                    }
                }
            ]
        });
        await alert.present();
    }
}

