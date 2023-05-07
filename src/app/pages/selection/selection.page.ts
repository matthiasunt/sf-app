import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
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

import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { trackShuttleById } from '../../utils/track-by-id.utils';
import { map, switchMap } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { HistoryElement } from '@models/history-element';
import { Districts } from '../../../assets/data/districts';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.page.html',
  styleUrls: ['./selection.page.scss'],
  providers: [CallNumber],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionPage implements OnInit {
  trackById = trackShuttleById;

  private districtId: string | undefined = undefined;
  district$: Observable<District | undefined>;
  coords$ = new BehaviorSubject<MyCoordinates | undefined>(undefined);
  localityName$ = new BehaviorSubject<string | undefined>(undefined);

  shuttles$: Observable<Shuttle[]>;

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

  ngOnInit() {
    this.districtId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.districtId) {
      this.district$ = of(Districts.find((d) => d.id == this.districtId));
      this.shuttles$ = this.shuttlesService.getShuttles(this.districtId);
    } else {
      this.populateGpsResult();
    }
  }

  private async populateGpsResult() {
    const coords = await this.geoService.getCurrentPosition();
    this.coords$.next(coords);
    const locale = await this.localDataService.locale$.toPromise();
    this.localityName$.next(
      await this.geoService.getLocalityName(coords, locale)
    );
    this.shuttles$ = this.shuttlesService.getShuttlesFromCoords(coords);
  }

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
    let callOrigin: CallOrigin;
    if (this.districtId) {
      callOrigin = {
        name: CallOriginName.District,
        value: this.districtId,
      };
    } else {
      callOrigin = {
        name: CallOriginName.Gps,
        value: this.coords$.getValue(),
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
  }
}
