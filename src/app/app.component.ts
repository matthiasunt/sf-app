import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from './services/local-data/local-data.service';
import {AuthService} from './services/auth/auth.service';
import {ENV} from '@env';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private translate: TranslateService,
        private authService: AuthService,
        private localDataService: LocalDataService,
    ) {
        this.initializeApp();
        this.setLang();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // this.authService.doSoftLogin();
            this.statusBar.overlaysWebView(false);
            this.statusBar.styleLightContent();
            this.splashScreen.hide();
        });
    }

    private async setLang() {
        this.translate.setDefaultLang('en');
        const lang = await this.localDataService.getPrefLang();
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
