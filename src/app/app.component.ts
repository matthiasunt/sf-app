import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from './services/local-data/local-data.service';
import {AuthService} from './services/auth/auth.service';
import {Plugins} from '@capacitor/core';
import {ENV} from '@env';

const {SplashScreen} = Plugins;
const {Device} = Plugins;


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private statusBar: StatusBar,
        private translate: TranslateService,
        private authService: AuthService,
        private localDataService: LocalDataService,
    ) {
        this.initializeApp();
        this.setLang();
    }

    async initializeApp() {
        this.platform.ready().then(async () => {
            const info = await Device.getInfo();
            console.log(info);
            if (info.platform !== 'web') {
                SplashScreen.hide();
            }
            // this.authService.doSoftLogin();
            this.statusBar.overlaysWebView(false);
            this.statusBar.styleLightContent();
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
