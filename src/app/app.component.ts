import {Component} from '@angular/core';
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
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {DistrictsService} from '@services/data/districts/districts.service';


const {SplashScreen} = Plugins;
const {StatusBar} = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private deviceService: DeviceService,
        private sfDbService: SfDbService,
        private userDbService: UserDbService,
        private districtsService: DistrictsService,
        private shuttlesService: ShuttlesService,
        private listsService: ListsService,
        private callsService: CallsService,
        private ratingService: RatingsService,
        private translate: TranslateService,
        private authService: AuthService,
        private localDataService: LocalDataService,
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
        // this.authService.doSoftLogin();3
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
