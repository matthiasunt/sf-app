import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import {
  NavController,
  PopoverController,
  ToastController,
} from '@ionic/angular';

import { ShuttlesService } from '@services/data/shuttles.service';
import { CallsService } from '@services/data/calls.service';
import { ListsService } from '@services/data/lists.service';
import { AuthService } from '@services/auth.service';
import { LocalDataService } from '@services/data/local-data.service';

import { Shuttle } from '@models/shuttle';
import { CallOrigin, CallOriginName } from '@models/call';
import { ElementType, ListElement } from '@models/list-element';
import { GeoService } from '@services/geo.service';
import { Rating } from '@models/rating';
import { RatingsService } from '@services/data/ratings.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { District } from '@models/district';
import { DistrictsService } from '@services/data/districts.service';

@Component({
  selector: 'app-shuttle',
  templateUrl: './shuttle.page.html',
  styleUrls: ['./shuttle.page.scss'],
  providers: [CallNumber],
})
export class ShuttlePage {
  private unsubscribe$ = new Subject<void>();

  shuttle$: Observable<Shuttle> = this.shuttlesService.getShuttle(
    this.activatedRoute.snapshot.paramMap.get('id')
  );
  districts$: Observable<District[]> = this.shuttle$.pipe(
    withLatestFrom(this.districtsService.districts$),
    map(([shuttle, districts]) =>
      districts.filter((d) => shuttle.districtIds.indexOf(d.id) > -1)
    )
  );

  shuttleRatings$ = this.shuttle$.pipe(
    switchMap((shuttle) => this.ratingsService.getRatings(shuttle.id))
  );

  userRating$: Observable<Rating> = this.shuttleRatings$.pipe(
    switchMap((ratings) =>
      this.authService.userId$.pipe(
        map((userId) => ratings.find((r) => r.userId === userId))
      )
    )
  );

  isFavorite$: Observable<boolean> = this.shuttle$.pipe(
    withLatestFrom(this.localDataService.favoriteShuttles),
    map(
      ([shuttle, favorites]) =>
        favorites.findIndex((s) => s.id === shuttle.id) > -1
    )
  );

  constructor(
    private zone: NgZone,
    private navCtrl: NavController,
    public translate: TranslateService,
    private toastController: ToastController,
    private popoverController: PopoverController,
    private geoService: GeoService,
    private callNumber: CallNumber,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public localDataService: LocalDataService,
    private listsService: ListsService,
    private shuttlesService: ShuttlesService,
    private districtsService: DistrictsService,
    public callsService: CallsService,
    private ratingsService: RatingsService
  ) {}

  public async callClicked(shuttle: Shuttle) {
    const callOrigin = await this.getCallOrigin();
    await this.callsService.setCallHandlerData(shuttle.id, callOrigin);
    await this.callNumber.callNumber(shuttle.phone, true);
    await this.localDataService.addToHistory({
      shuttle: shuttle,
      date: new Date(),
    });
  }

  public rateClicked(shuttleId: string) {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(currentUrl + '/rate/' + shuttleId);
  }

  public toRatingsPage(shuttleId: string) {
    const currentUrl = this.router.url;
    this.navCtrl.navigateForward(currentUrl + '/ratings/' + shuttleId);
  }

  public async addToFavorites(shuttle: Shuttle) {
    const userId: string | undefined = await this.authService.userId$
      .pipe(take(1))
      .toPromise();
    if (userId) {
      const listElement: ListElement = {
        id: `${userId}--${ElementType.Favorites}--${shuttle.id}`,
        userId: userId,
        shuttleId: shuttle.id,
        date: new Date().toISOString(),
        type: ElementType.Favorites,
      };
      this.listsService.addListElement(listElement);
      this.localDataService.addFavoriteShuttle(shuttle);
      this.presentAddedToFavoritesToast();
    }
  }

  /* Toasts & Alerts */
  private async presentAddedToFavoritesToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('shuttle.SHUTTLE_ADDED_TO_FAVORITES'),
      position: 'bottom',
      duration: 1700,
      color: 'secondary',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  public removeFromFavorites(shuttle: Shuttle) {
    this.localDataService.removeFavoriteShuttle(shuttle);
    this.listsService.removeListElement(
      shuttle.id,
      this.addToFavorites ? ElementType.Favorites : ElementType.Blacklisted
    );
    this.presentRemovedFromFavoritesToast();
  }

  private async presentRemovedFromFavoritesToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant('shuttle.SHUTTLE_REMOVED_FROM_FAVORITES'),
      position: 'bottom',
      duration: 1700,
      color: 'danger',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  private async getCallOrigin(): Promise<CallOrigin> {
    let callOrigin: CallOrigin;
    const url: string[] = this.router.url.split('/');
    if (url.includes('history')) {
      callOrigin = { name: CallOriginName.History, value: '' };
    } else if (url.includes('district')) {
      callOrigin = {
        name: CallOriginName.District,
        value: url[url.indexOf('district') + 1],
      };
    } else if (url.includes('gps')) {
      callOrigin = {
        name: CallOriginName.Gps,
        value: await this.geoService.getCurrentPosition(),
      };
    } else if (
      url.includes('find') &&
      url.indexOf('find') === url.indexOf('shuttle') - 1
    ) {
      console.log('Favorites');
      callOrigin = { name: CallOriginName.Favorites, value: '' };
    } else {
      callOrigin = { name: CallOriginName.Other, value: this.router.url };
    }
    return callOrigin;
  }
}
