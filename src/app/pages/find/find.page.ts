import {Component, NgZone, OnInit} from '@angular/core';
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
import {ListElement} from '@models/list-element';

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss'],
    providers: [CallNumber],
})
export class FindPage implements OnInit {

    favorites: Shuttle[];

    lang: string;
    districts: District[] = districts;

    constructor(private zone: NgZone,
                private navCtrl: NavController,
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
                private localDataService: LocalDataService,
    ) {
    }

    async ngOnInit() {
        this.localDataService.lang.subscribe((lang: string) => this.lang = lang);

        console.log(ENV.message);
        this.fetchFavorites();

    }

    private fetchFavorites() {
        this.listsService.favorites.subscribe((favorites) => {
            this.shuttlesService.allShuttles.subscribe((allShuttles) => {
                this.favorites = [];
                favorites.map((favorite: ListElement) => {
                    this.favorites.push(allShuttles.get(favorite.shuttleId));
                });
            });
        });
    }

    private async districtClicked(district) {
        this.navCtrl.navigateForward('/tabs/find/district/' + district._id);
    }

    public async gpsClicked() {
        // Device testing
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
            // Browser testing
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

    /* Toasts */
    public async presentConnectionToast() {
        const toast = await this.toastCtrl.create({
            message: this.translate.instant('VERIFY_CONNECTION'),
            showCloseButton: true,
            closeButtonText: this.translate.instant('OK'),
            position: 'bottom'
        });
        await toast.present();
    }


    public async presentNoShuttleFoundToast() {
        const toast = await this.toastCtrl.create({
            message: this.translate.instant('NO_SHUTTLE_FOUND'),
            showCloseButton: true,
            closeButtonText: this.translate.instant('OK'),
            position: 'bottom'
        });
        await toast.present();
    }

    public getTMMUrl() {
        if (this.translate.currentLang === 'it') {
            return 'http://bit.ly/zero-compromessi';
        } else {
            return 'http://bit.ly/keine-kompromisse';
        }
    }
}

const districts = [
    {
        'type': 'district',
        'name': {
            'de': 'Bozen & Umgebung',
            'it': 'Bolzano e dintorni',
            'de_st': 'Boazen & Umgebung'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.501696,
            'longitude': 11.350951
        },
        '_id': 'italien-suedtirol-bozenumgebung',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Burggrafenamt',
            'it': 'Burgraviato',
            'de_st': 'Burggrofenomt'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.669695,
            'longitude': 11.144957
        },
        '_id': 'italien-suedtirol-burggrafenamt',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Eisacktal',
            'it': 'Valle Isarco',
            'de_st': 'Eisocktol'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.711143,
            'longitude': 11.658568
        },
        '_id': 'italien-suedtirol-eisacktal',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Pustertal',
            'it': 'Val Pusteria',
            'de_st': 'Pustotol'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.799584,
            'longitude': 11.951079
        },
        '_id': 'italien-suedtirol-pustertal',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Schlerngebiet - Gröden',
            'it': 'Altopiano dello Sciliar - Val Gardena',
            'de_st': 'Schlerngebiet - Greden'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.567705,
            'longitude': 11.653147
        },
        '_id': 'italien-suedtirol-schlerngebietgroeden',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Überetsch - Unterland',
            'it': 'Oltradige - Bassa Atesina',
            'de_st': 'Überetsch - Unterlond'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.345476,
            'longitude': 11.296343
        },
        '_id': 'italien-suedtirol-ueberetschunterland',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Vinschgau',
            'it': 'Val Venosta',
            'de_st': 'Vinschgau'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.640144,
            'longitude': 10.732828
        },
        '_id': 'italien-suedtirol-vinschgau',
    },
    {
        'type': 'district',
        'name': {
            'de': 'Wipptal',
            'it': 'Wipptal',
            'de_st': 'Wipptol'
        },
        'region': {
            'de': 'Südtirol',
            'it': 'Alto Adige'
        },
        'country': {
            'de': 'Italien',
            'it': 'Italia'
        },
        'coordinates': {
            'latitude': 46.89412,
            'longitude': 11.463419
        },
        '_id': 'italien-suedtirol-wipptal',
    }
];

