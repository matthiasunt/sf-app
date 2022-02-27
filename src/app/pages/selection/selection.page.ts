import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocalDataService } from '@services/data/local-data.service';
import { GeoService } from '@services/geo.service';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ActivatedRoute, Router } from '@angular/router';

import { ShuttlesService } from '@services/data/shuttles.service';
import { DistrictsService } from '@services/data/districts.service';
import { CallsService } from '@services/data/calls.service';

import { CallOrigin, CallOriginName } from '@models/call';
import { District } from '@models/district';
import { Shuttle } from '@models/shuttle';
import { MyCoordinates } from '@models/my-coordinates';

import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.page.html',
  styleUrls: ['./selection.page.scss'],
  providers: [CallNumber],
})
export class SelectionPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  shuttles$: Observable<Shuttle[]> = new Observable<Shuttle[]>();
  district$: Observable<District>;
  districtId: string;

  coordinates: MyCoordinates;
  currentLocality: string;

  noValidLocalityName: boolean;
  outOfRange: boolean;
  lang: string;

  timer: any;
  disableLoading: boolean;

  alertDismissed = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private callNumber: CallNumber,
    private deviceService: DeviceService,
    private translate: TranslateService,
    private districtsService: DistrictsService,
    private shuttlesService: ShuttlesService,
    private callsService: CallsService,
    public localDataService: LocalDataService,
    private geoService: GeoService
  ) {}

  async ngOnInit() {
    this.localDataService.lang
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((lang: string) => (this.lang = lang));

    this.districtId = this.activatedRoute.snapshot.paramMap.get('id');
    this.district$ = this.districtsService.getDistrict(this.districtId);

    if (this.districtId) {
      this.fetchShuttlesByDistrict(this.districtId);
    } else {
      this.coordinates = await this.geoService.getCurrentPosition();
      this.fetchShuttlesByPosition();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ionViewDidEnter() {
    this.timer = setTimeout(() => {
      this.shuttles$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((shuttles) => {
          if (!this.disableLoading && shuttles.length < 1) {
            this.presentShuttleFinderUnavailableAlert();
          }
        });
    }, 10000);
  }

  ionViewWillLeave() {
    clearTimeout(this.timer);
  }

  private fetchShuttlesByDistrict(districtId: string) {
    this.shuttles$ = combineLatest([
      this.shuttlesService.getShuttlesByDistrict(districtId),
      this.localDataService.favoriteShuttles,
      this.localDataService.blacklistedShuttles,
    ]).pipe(
      map(([shuttles, favoriteShuttles, blacklistedShuttles]) => {
        return this.shuttlesService
          .mergeShuttles(shuttles, favoriteShuttles, blacklistedShuttles)
          .toArray();
      })
    );
  }

  private async fetchShuttlesByPosition() {
    this.shuttles$ = combineLatest([
      this.shuttlesService.allShuttles,
      this.localDataService.favoriteShuttles,
      this.localDataService.blacklistedShuttles,
    ]).pipe(
      map(([allShuttles, favoriteShuttles, blacklistedShuttles]) => {
        let shuttles = this.shuttlesService.filterShuttlesByPosition(
          allShuttles,
          this.coordinates,
          22000
        );
        if (shuttles.count() < 3) {
          shuttles = this.shuttlesService.filterShuttlesByPosition(
            allShuttles,
            this.coordinates,
            27000
          );
        }
        if (!shuttles || shuttles.count() < 1) {
          this.outOfRange = true;
        } else {
          return this.shuttlesService
            .mergeShuttles(shuttles, favoriteShuttles, blacklistedShuttles)
            .toArray();
        }
      })
    );

    // Get Locality Name
    const lang = this.lang === 'it' ? 'it' : 'de';

    // TODO: Refactor to rxjs
    this.currentLocality = await this.geoService.getLocalityName(
      this.coordinates,
      lang
    );
    if (!this.currentLocality || this.currentLocality.length < 1) {
      this.noValidLocalityName = true;
    }
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle._id);
  }

  public callClicked(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    let callOrigin: CallOrigin;
    if (this.districtId) {
      callOrigin = {
        name: CallOriginName.District,
        value: this.districtId,
      };
    } else if (this.coordinates) {
      callOrigin = {
        name: CallOriginName.Gps,
        value: this.coordinates,
      };
    }
    this.callsService.setCallHandlerData(shuttle._id, callOrigin);
    this.callNumber.callNumber(shuttle.phone, true);
    this.localDataService.addToHistory({ shuttle, date: new Date() });
  }

  /* Alerts */
  private async presentShuttleFinderUnavailableAlert() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('NOT_AVAILABLE'),
      buttons: [
        {
          text: this.translate.instant('OK'),
          handler: () => {
            this.navCtrl.pop();
          },
        },
      ],
    });
    // Dismass if data here
    this.shuttles$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (shuttles) => {
        if (shuttles.length > 0 && !this.alertDismissed) {
          await alert.dismiss();
          this.alertDismissed = true;
        }
      });
    await alert.present();
    this.disableLoading = true;
  }
}
