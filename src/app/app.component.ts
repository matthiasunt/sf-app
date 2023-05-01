import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import { LocalDataService } from '@services/data/local-data.service';
import { AuthService } from '@services/auth.service';
import { DeviceService } from '@services/device.service';
import { ShuttlesService } from '@services/data/shuttles.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private deviceService: DeviceService,
    private translate: TranslateService,
    private localDataService: LocalDataService,
    private shuttlesService: ShuttlesService
  ) {
    this.initializeApp();
    this.setLang();
  }

  private async initializeApp() {
    if (await this.deviceService.isDevice()) {
      await SplashScreen.hide();
      if ((await this.deviceService.getPlatform()) === 'android') {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setBackgroundColor({ color: 'black' });
      }
    }
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
