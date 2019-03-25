import {Component, NgZone, OnInit} from '@angular/core';
import {AlertController, NavController, ToastController} from '@ionic/angular';
import {HttpClientModule} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {Router} from '@angular/router';
import {CallNumber} from '@ionic-native/call-number/ngx';

import {DistrictsService} from '@services/data/districts/districts.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {GeoService} from '@services/geo/geo.service';
import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ListsService} from '@services/data/lists/lists.service';
import {DeviceService} from '@services/device/device.service';
import {District} from '@models/district';
import {Shuttle} from '@models/shuttle';
import {ENV} from '@env';
import {getContrastColor} from '../../tools/sf-tools';

@Component({
    selector: 'app-find',
    templateUrl: 'find.page.html',
    styleUrls: ['find.page.scss'],
    providers: [CallNumber],
})
export class FindPage implements OnInit {

    favorites: Shuttle[];

    lang: string;
    districts = districts;

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
                private localData: LocalDataService,
                private geoService: GeoService,
                public colorGenerator: ColorGeneratorService,
    ) {
    }

    async ngOnInit(): Promise<void> {
        console.log(ENV.message);
        this.listsService.favorites.subscribe((favorites) => {
            // this.zone.run(async () => {
                const favoriteShuttles = this.shuttlesService.getShuttlesFromList(favorites);
                this.favorites = favoriteShuttles.toArray();
                console.log(this.favorites);
            // });
        });
        this.localData.getLang().then((lang) => {
            this.lang = lang;
        });
    }

    private async districtClicked(district) {
        this.navCtrl.navigateForward('/tabs/find/district/' + district._id);
        this.localData.setRecentDistricts(district);
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

    public getDistrictColors(district: District) {
        if (district) {
            return this.colorGenerator.getDistrictColors(district);
        }
    }

    public getDistrictName(district: any): string {
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
            'latitude': '46.501696',
            'longitude': '11.350951'
        },
        '_id': 'italien-suedtirol-bozenumgebung',
        '_rev': '1-84fd4d7b656e3fb8eea9456ce5823a36'
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
            'latitude': '46.669695',
            'longitude': '11.144957'
        },
        '_id': 'italien-suedtirol-burggrafenamt',
        '_rev': '1-4874eed1834030ae9ede49e767063fe6'
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
            'latitude': '46.711143',
            'longitude': '11.658568'
        },
        '_id': 'italien-suedtirol-eisacktal',
        '_rev': '1-d42d123b9f31735f6761c766e6aeeca0'
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
            'latitude': '46.799584',
            'longitude': '11.951079'
        },
        '_id': 'italien-suedtirol-pustertal',
        '_rev': '1-2eb7fdeee3e394bb69e2c0f0032cb4ee'
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
            'latitude': '46.567705',
            'longitude': '11.653147'
        },
        '_id': 'italien-suedtirol-schlerngebietgroeden',
        '_rev': '1-47fa2f218cf576de34bbb5e5dbaa2f32'
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
            'latitude': '46.345476',
            'longitude': '11.296343'
        },
        '_id': 'italien-suedtirol-ueberetschunterland',
        '_rev': '1-5679e48a46300f7f462bf462486d1830'
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
            'latitude': '46.640144',
            'longitude': '10.732828'
        },
        '_id': 'italien-suedtirol-vinschgau',
        '_rev': '1-33e91eacbbcd52c7a68a7d125f1faf73'
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
            'latitude': '46.89412',
            'longitude': '11.463419'
        },
        '_id': 'italien-suedtirol-wipptal',
        '_rev': '1-04f132aad1fddd62884c72e25f7a822c'
    }
];

