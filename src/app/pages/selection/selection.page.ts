import {Component, OnInit, OnDestroy} from '@angular/core';
import {LocalDataService} from '@services/data/local-data/local-data.service';
import {GeoService} from '@services/geo/geo.service';
import {AlertController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {ActivatedRoute, Router} from '@angular/router';

import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {DistrictsService} from '@services/data/districts/districts.service';
import {ListsService} from '@services/data/lists/lists.service';
import {CallsService} from '@services/data/calls/calls.service';
import {AuthService} from '@services/auth/auth.service';

import {CallOrigin, CallOriginName} from '@models/call';
import {District} from '@models/district';
import {Shuttle} from '@models/shuttle';
import {MyCoordinates} from '@models/my-coordinates';
import {List} from 'immutable';
import {combineLatest, Observable, Subject, timer} from 'rxjs';
import {takeUntil, map, switchMap, filter, debounce, withLatestFrom} from 'rxjs/operators';

import {DeviceService} from '@services/device/device.service';


@Component({
    selector: 'app-selection',
    templateUrl: './selection.page.html',
    styleUrls: ['./selection.page.scss'],
    providers: [CallNumber],
})
export class SelectionPage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();
    shuttles$: Observable<Shuttle[]>;
    district$: Observable<District>;
    districtId: string;

    coordinates: MyCoordinates;
    currentLocality: string;

    noValidLocalityName: boolean;
    outOfRange: boolean;
    lang: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private alertCtrl: AlertController,
                private callNumber: CallNumber,
                private deviceService: DeviceService,
                private translate: TranslateService,
                private districtsService: DistrictsService,
                private shuttlesService: ShuttlesService,
                private authService: AuthService,
                private callsService: CallsService,
                private listsService: ListsService,
                public localDataService: LocalDataService,
                private geoService: GeoService,
    ) {

    }

    async ngOnInit() {
        this.localDataService.lang
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((lang: string) => this.lang = lang);

        this.districtId = this.activatedRoute.snapshot.paramMap.get('id');
        this.district$ = this.districtsService.getDistrict(this.districtId);
        if (this.districtId) {
            this.fetchShuttlesByDistrict(this.districtId);
        } else {
            this.coordinates = await this.geoService.getCurrentPosition();
            this.fetchShuttlesByPosition();
        }

        // Not available, if no data after 7 secs.
        // setTimeout(() => {
        //     if (this.shuttles.length < 1) {
        //         this.presentShuttleFinderUnavailableAlert();
        //     }
        // }, 7000);


    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private fetchShuttlesByDistrict(districtId: string) {
        this.shuttles$ = this.shuttlesService.getShuttlesByDistrict(districtId).pipe(
            map((shuttles) => {
                return this.mergeShuttles(shuttles);
            })
        );
    }


    // TODO: Outsource this
    private async fetchShuttlesByPosition() {
        const lang = this.lang === 'it' ? 'it' : 'de';

        // Fetch
        this.shuttles$ = this.shuttlesService.allShuttles.pipe(
            map((allShuttles) => {
                let shuttles = this.shuttlesService.filterShuttlesByPosition(
                    allShuttles.toList(), this.coordinates, 22000
                );
                if (shuttles.count() < 3) {
                    shuttles = this.shuttlesService.filterShuttlesByPosition(
                        allShuttles.toList(), this.coordinates, 27000
                    );
                }
                if (!shuttles || shuttles.count() < 1) {
                    this.outOfRange = true;
                } else {
                    return this.mergeShuttles(shuttles);
                }
            })
        );

        // Get Locality Name
        this.currentLocality = await this.geoService.getLocalityName(this.coordinates, lang);
        if (!this.currentLocality || this.currentLocality.length < 1) {
            this.noValidLocalityName = true;
        }
    }

    private mergeShuttles(shuttles: List<Shuttle>) {
        return this.shuttlesService.mergeShuttles(
            this.shuttlesService.rankShuttlesByScore(shuttles),
            this.listsService.favorites.getValue(),
            this.listsService.blacklist.getValue()).toArray();

        /* Unsubscribe from changes if Shuttles fetched */
        // if (this.shuttles.length > 3) {
        //     this.unsubscribe$.next();
        //     this.unsubscribe$.complete();
        // }
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
                value: this.districtId
            };
        } else if (this.coordinates) {
            callOrigin = {
                name: CallOriginName.Gps,
                value: this.coordinates
            };
        }
        this.callsService.setCallHandlerData(shuttle._id, callOrigin);
        this.callNumber.callNumber(shuttle.phone, true);
        this.localDataService.addToHistory({shuttle, date: new Date()});
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
                    }
                }
            ]
        });
        await alert.present();
    }
}
