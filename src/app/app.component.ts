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
        translate.setDefaultLang('en');
        const lang = localDataService.getPrefLang();
        if (lang) {
            translate.use(lang);
        } else {
            switch (translate.getBrowserLang()) {
                case 'de':
                    translate.use('de');
                    break;
                case 'it':
                    translate.use('it');
                    break;
                default:
                    translate.use('en');
                    break;
            }
        }
    }

    initializeApp() {
        this.platform.ready().then(() => {
            if (ENV.production) {
                this.authService.doSoftLogin();
            }
            this.statusBar.overlaysWebView(false);
            // this.statusBar.backgroundColorByHexString('#99CC33');
            // this.statusBar.styleLightContent();
            this.statusBar.styleLightContent()
            this.splashScreen.hide();
        });
    }
}
