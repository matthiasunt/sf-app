import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { DistrictsService } from '@services/data/districts.service';
import { LocalDataService } from '@services/data/local-data.service';
import { DeviceService } from '@services/device.service';
import { District } from '@models/district';
import { Shuttle } from '@models/shuttle';
import { environment } from '@env';
import { Districts } from '../../../assets/data/districts';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-find',
  templateUrl: 'find.page.html',
  styleUrls: ['find.page.scss'],
  providers: [CallNumber],
})
export class FindPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public lang: string;
  public districts: District[] = Districts;

  public devMessage: string;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private http: HttpClientModule,
    private deviceService: DeviceService,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    public districtsService: DistrictsService,
    public localDataService: LocalDataService
  ) {}

  async ngOnInit() {
    this.localDataService.lang.subscribe((lang: string) => (this.lang = lang));
    console.log(environment.message);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async districtClicked(district) {
    await this.navCtrl.navigateForward('/tabs/find/district/' + district.id);
  }

  public async gpsClicked() {
    try {
      const permission = await Geolocation.checkPermissions();
      if (
        permission.location != 'granted' &&
        permission.coarseLocation != 'granted'
      ) {
        await Geolocation.requestPermissions();
      }
    } catch (err) {
      await this.presentEnableGpsAlert();
      console.error(err);
    }

    try {
      await Geolocation.getCurrentPosition();
      await this.navCtrl.navigateForward(`/tabs/find/gps`);
    } catch {
      await this.presentEnableGpsAlert();
    }
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle.id);
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
