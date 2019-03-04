import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from './services/data/local-data/local-data.service';
import {AuthService} from './services/auth/auth.service';
import {Plugins} from '@capacitor/core';
import {DeviceService} from './services/device/device.service';
import {SfDbService} from './services/data/sf-db/sf-db.service';
import {UserDbService} from './services/data/user-db/user-db.service';
import {CallsService} from './services/data/calls/calls.service';
import {ListsService} from './services/data/lists/lists.service';

const {SplashScreen} = Plugins;


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
        private statusBar: StatusBar,
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
            }
            this.authService.doSoftLogin();
            this.statusBar.overlaysWebView(true);
            this.statusBar.styleBlackOpaque();
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
