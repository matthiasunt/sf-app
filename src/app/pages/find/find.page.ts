import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { LocalDataService } from '@services/data/local-data.service';
import { District } from '@models/district';
import { Shuttle } from '@models/shuttle';
import { environment } from '@env';
import { Districts } from '../../../assets/data/districts';
import { Subject } from 'rxjs';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { AnalyticsEvent } from '../../logging/analytics-event';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss'],
  providers: [CallNumber],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindPage {
  public districts: District[] = Districts;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private http: HttpClientModule,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    public localDataService: LocalDataService
  ) {
    console.log(environment.message);
  }

  async districtClicked(district) {
    logEvent(getAnalytics(), AnalyticsEvent.FindViaDistrictTapped);
    await this.navCtrl.navigateForward(`/tabs/find/district/${district.id}`);
  }

  public async gpsClicked() {
    logEvent(getAnalytics(), AnalyticsEvent.FindViaGpsButtonTapped);
    try {
      // Requests the permission if it hasn't already been granted
      let permission = await Geolocation.requestPermissions();

      if (
        permission.location != 'granted' ||
        permission.coarseLocation != 'granted'
      ) {
        await this.presentEnableGpsAlert();
      } else {
        await this.navCtrl.navigateForward(`/tabs/find/gps`);
      }
    } catch (err) {
      await this.presentEnableGpsAlert();
      console.error(err);
    }
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(`${currentUrl}/shuttle/${shuttle.id}`);
  }

  /* Alerts */
  private async presentEnableGpsAlert() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('departure.msg.ENABLE_GPS'),
      buttons: [
        { text: this.translate.instant('CANCEL') },
        {
          text: this.translate.instant('OK'),
          handler: () => {
            // this.diagnostic.switchToLocationSettings();
          },
        },
      ],
    });
    await alert.present();
  }
}
