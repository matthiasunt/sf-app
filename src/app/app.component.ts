import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Plugins, StatusBarStyle} from '@capacitor/core';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {AuthService} from '@services/auth/auth.service';
import {DeviceService} from '@services/device/device.service';
import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {UserDbService} from '@services/data/user-db/user-db.service';
import {CallsService} from '@services/data/calls/calls.service';
import {ListsService} from '@services/data/lists/lists.service';
import {RatingsService} from '@services/data/ratings/ratings.service';


const {SplashScreen} = Plugins;
const {StatusBar} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private deviceService: DeviceService,
        private sfDbService: SfDbService,
        private userDbService: UserDbService,
        private callsService: CallsService,
        public listsService: ListsService,
        private ratingService: RatingsService,
        private translate: TranslateService,
        private authService: AuthService,
        private localDataService: LocalDataService,
    ) {
        this.initializeApp();
        this.setLang();
    }

    private async initializeApp() {
        this.platform.ready().then(async () => {
            if (this.deviceService.isDevice()) {
                SplashScreen.hide();
                StatusBar.setStyle({style: StatusBarStyle.Light});
                StatusBar.setBackgroundColor({color: 'white'});
            }
            this.authService.doSoftLogin();
        });
    }

    private async setLang() {
        this.translate.setDefaultLang('en');
        const lang = await this.localDataService.getLang();
        if (lang) {
            this.translate.use(lang);
        } else {
            switch (this.translate.getBrowserLang()) {
                case 'de':
                    this.translate.use('de');
                    break;
                case 'it':
                    this.translate.use('it');
                    break;
                default:
                    this.translate.use('en');
                    break;
            }
        }
    }
}
