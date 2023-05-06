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

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  lang: string;

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
      this.shuttles$ = this.shuttlesService.getShuttles(this.districtId);
    } else {
      this.coordinates = await this.geoService.getCurrentPosition();
      this.fetchShuttlesByPosition();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private async fetchShuttlesByPosition() {
    this.shuttles$ = this.shuttlesService.getShuttlesFromCoords(
      this.coordinates
    );

    // Get Locality Name
    const lang = this.lang === 'it' ? 'it' : 'de';
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
    this.navCtrl.navigateForward(currentUrl + '/shuttle/' + shuttle.id);
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
    this.callsService.setCallHandlerData(shuttle.id, callOrigin);
    this.callNumber.callNumber(shuttle.phone, true);
    this.localDataService.addToHistory({ shuttle, date: new Date() });
  }
}
