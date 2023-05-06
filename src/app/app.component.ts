import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import { LocalDataService } from '@services/data/local-data.service';
import { AuthService } from '@services/auth.service';
import { filter, first, map } from 'rxjs/operators';
import {
  getAnalytics,
  setUserId,
  setUserProperties,
} from '@angular/fire/analytics';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private translate: TranslateService,
    private localDataService: LocalDataService
  ) {
    this.initializeApp();
    this.setLang();

    this.authService.userId$
      .pipe(
        filter((userId) => !!userId),
        first(),
        map((userId) => {
          setUserId(getAnalytics(), userId);
        })
      )
      .subscribe();
  }

  private async initializeApp() {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.hide();
      if (Capacitor.getPlatform() == 'android') {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: 'black' });
      }
    }
    setUserProperties(getAnalytics(), { device_info: await Device.getInfo() });
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
