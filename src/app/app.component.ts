import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Plugins, StatusBarStyle} from '@capacitor/core';
import {LocalDataService} from '@services/data/local-data.service';
import {AuthService} from '@services/auth.service';
import {DeviceService} from '@services/device.service';
import {ShuttlesService} from '@services/data/shuttles.service';


const {SplashScreen} = Plugins;
const {StatusBar} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private deviceService: DeviceService,
        private translate: TranslateService,
        private authService: AuthService,
        private localDataService: LocalDataService,
        private shuttlesService: ShuttlesService,
    ) {
        this.initializeApp();
        this.setLang();
    }

    private async initializeApp() {
        if (await this.deviceService.isDevice()) {
            SplashScreen.hide();
            if (await this.deviceService.getPlatform() === 'android') {
                StatusBar.setStyle({style: StatusBarStyle.Dark});
                StatusBar.setBackgroundColor({color: 'black'});
            }
        }
        this.authService.doSoftLogin();
    }

    private async setLang() {
        this.translate.setDefaultLang('en');
        this.localDataService.lang.subscribe((lang) => {
            if (lang === 'de' || lang === 'it') {
                this.translate.use(lang);
            } else {
                this.translate.use('en');
            }
        });
    }
}
