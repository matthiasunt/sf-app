import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

import { combineLatest, Observable, of } from 'rxjs';
import { trackShuttleById } from '../../utils/track-by-id.utils';
import { map, switchMap } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { HistoryElement } from '@models/history-element';
import { Analytics, getAnalytics, logEvent } from '@angular/fire/analytics';
import { AnalyticsEvent } from '../../logging/analytics-event';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.page.html',
  styleUrls: ['./selection.page.scss'],
  providers: [CallNumber],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionPage {
  trackById = trackShuttleById;

  private analytics: Analytics = inject(Analytics);

  district$: Observable<District | undefined> =
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) =>
        id ? this.districtsService.getDistrict(id) : of(undefined)
      )
    );

  coordinates$: Observable<MyCoordinates> =
    this.geoService.getCurrentPosition();

  localityName$: Observable<string> = combineLatest([
    this.coordinates$,
    this.localDataService.locale$,
  ]).pipe(
    switchMap(([coordinates, locality]) =>
      this.geoService.getLocalityName(coordinates, locality)
    )
  );

  shuttles$: Observable<Shuttle[]> = combineLatest([
    this.district$,
    this.coordinates$,
  ]).pipe(
    switchMap(([district, coordinates]) => {
      return district
        ? this.shuttlesService.getShuttles(district.id)
        : coordinates
        ? this.shuttlesService.getShuttlesFromCoords(coordinates)
        : of([]);
    })
  );

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private callNumber: CallNumber,
    private translate: TranslateService,
    private districtsService: DistrictsService,
    private shuttlesService: ShuttlesService,
    private callsService: CallsService,
    public localDataService: LocalDataService,
    private geoService: GeoService
  ) {}

  calledLately(history: HistoryElement[], shuttleId: string): boolean {
    const calledLast = history.filter((h) => {
      return (new Date().getTime() - new Date(h.date).getTime()) / 36e5 < 0.5;
    });
    return calledLast.findIndex((c) => c.shuttle.id === shuttleId) > -1;
  }

  async itemTapped(event: { shuttleId: string }) {
    await this.navCtrl.navigateForward(
      `${this.router.url}/shuttle/${event.shuttleId}`
    );
  }

  public callTapped(event: { shuttle: Shuttle }) {
    combineLatest([this.district$, this.coordinates$])
      .pipe(
        map(([district, coordinates]) => {
          let callOrigin: CallOrigin;
          if (district) {
            callOrigin = {
              name: CallOriginName.District,
              value: district.id,
            };
          } else if (coordinates) {
            callOrigin = {
              name: CallOriginName.Gps,
              value: coordinates,
            };
          }
          this.callsService.setCallHandlerData(event.shuttle.id, callOrigin);
          if (Capacitor.isNativePlatform) {
            this.callNumber.callNumber(event.shuttle.phone, true);
          }
          this.localDataService.addToHistory({
            shuttle: event.shuttle,
            date: new Date(),
          });
        })
      )
      .subscribe();
  }
}
