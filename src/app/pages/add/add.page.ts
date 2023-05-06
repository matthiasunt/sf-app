import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Shuttle } from '@models/shuttle';
import { Router } from '@angular/router';
import { ShuttlesService } from '@services/data/shuttles.service';
import { ListsService } from '@services/data/lists.service';
import { ElementType, ListElement } from '@models/list-element';

import { AuthService } from '@services/auth.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { LocalDataService } from '@services/data/local-data.service';
import { FormControl } from '@angular/forms';
import { trackShuttleById } from '../../utils/track-by-id.utils';
import { ListAction } from '@components/sf-shuttle-item/sf-shuttle-item.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPage implements OnInit {
  trackById = trackShuttleById;
  ListAction = ListAction;

  addToFavorites: boolean;
  searchControl = new FormControl();
  allShuttles$: Observable<Shuttle[]> = this.shuttlesService.shuttles$;
  result$: Observable<Shuttle[]> = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(0),
    distinctUntilChanged(),
    switchMap((searchTerm) => this.searchShuttles(searchTerm))
  );
  favorites$: Observable<Shuttle[]> = this.localDataService.favoriteShuttles;
  blacklisted$: Observable<Shuttle[]> =
    this.localDataService.blacklistedShuttles;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private authService: AuthService,
    private shuttlesService: ShuttlesService,
    public listsService: ListsService,
    public localDataService: LocalDataService
  ) {}

  async ngOnInit() {
    const splitUrl = this.router.url.split('/');
    this.addToFavorites = splitUrl[splitUrl.length - 2] === 'favorites';
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.router.navigate([currentUrl + '/shuttle/' + shuttle.id]);
  }

  async listActionTapped(event: { shuttle: Shuttle; action: ListAction }) {
    switch (event.action) {
      case ListAction.AddToFavorites:
        this.addToList(event.shuttle, event.action);
        return;
      case ListAction.RemoveFromFavorites:
        await this.removeFromList(event.shuttle, event.action);
        return;
      case ListAction.AddToBlacklisted:
        this.addToList(event.shuttle, event.action);
        return;
      case ListAction.RemoveFromBlacklisted:
        await this.removeFromList(event.shuttle, event.action);
        return;
    }
  }

  public actionType(shuttleId: string): Observable<ListAction> {
    return this.isInList(shuttleId).pipe(
      map((isInList) =>
        this.addToFavorites
          ? isInList
            ? ListAction.RemoveFromFavorites
            : ListAction.AddToFavorites
          : isInList
          ? ListAction.RemoveFromBlacklisted
          : ListAction.AddToBlacklisted
      )
    );
  }

  /* Adding and removing from lists logic */
  private isInList(shuttleId: string): Observable<boolean> {
    if (!shuttleId) {
      return of(false);
    }
    return combineLatest([this.favorites$, this.blacklisted$]).pipe(
      map(([favorites, blacklisted]) => {
        const list: Shuttle[] = this.addToFavorites ? favorites : blacklisted;
        return list.findIndex((s) => s && s.id && s.id === shuttleId) > -1;
      })
    );
  }

  private async removeFromList(shuttle: Shuttle, listAction: ListAction) {
    if (listAction == ListAction.RemoveFromFavorites) {
      await this.localDataService.removeFavoriteShuttle(shuttle);
    } else {
      await this.localDataService.removeBlacklistedShuttle(shuttle);
    }
    await this.listsService.removeListElement(
      shuttle.id,
      listAction == ListAction.RemoveFromFavorites
        ? ElementType.Favorites
        : ElementType.Blacklisted
    );
  }

  // TODO: extract add and remove from list
  private addToList(shuttle: Shuttle, listAction: ListAction) {
    const type =
      listAction == ListAction.AddToFavorites
        ? ElementType.Favorites
        : ElementType.Blacklisted;
    this.authService.userId$
      .pipe(
        first(),
        withLatestFrom(
          this.addToFavorites ? this.blacklisted$ : this.favorites$
        ),
        switchMap(([userId, listToCheck]) => {
          const alreadyInList =
            listToCheck.findIndex((e) => e.id === shuttle.id) >= 0;
          if (alreadyInList) {
            this.presentAlreadyAddedInOtherListAlert();
            return of(undefined);
          }

          const listElement: ListElement = {
            id: `${userId}--${type}--${shuttle.id}`,
            userId: userId,
            shuttleId: shuttle.id,
            date: new Date().toISOString(),
            type: type,
          };

          if (this.addToFavorites) {
            this.localDataService.addFavoriteShuttle(shuttle);
          } else {
            this.localDataService.addBlacklistedShuttle(shuttle);
          }
          return of(this.listsService.addListElement(listElement)).pipe(
            catchError((error) => {
              console.error(error);
              return of(undefined);
            })
          );
        })
      )
      .subscribe();
  }

  /* Search logic */
  private searchShuttles(searchTerm: string): Observable<Shuttle[]> {
    if (searchTerm == '') {
      return this.allShuttles$;
    }

    return this.allShuttles$.pipe(
      map((shuttles) => shuttles.filter((s) => this.isMatch(s, searchTerm)))
    );
  }

  private isMatch = (shuttle: Shuttle, searchTerm: string): boolean => {
    searchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
    const name = shuttle.name.toLowerCase().replace(/\s/g, '').replace("'", '');
    const phone = shuttle.phone
      .toLowerCase()
      .replace(/\s/g, '')
      .replace("'", '');

    return name.indexOf(searchTerm) > -1 || phone.indexOf(searchTerm) > -1;
  };

  /* Alerts */
  private async presentAlreadyAddedInOtherListAlert() {
    const title = this.addToFavorites
      ? this.translate.instant('add.msg.ALREADY_ADDED_IN_BLACKLIST_TITLE')
      : this.translate.instant('add.msg.ALREADY_ADDED_IN_FAVORITES_TITLE');

    const subTitle = this.addToFavorites
      ? this.translate.instant('add.msg.ALREADY_ADDED_IN_BLACKLIST_SUBTITLE')
      : this.translate.instant('add.msg.ALREADY_ADDED_IN_FAVORITES_SUBTITLE');

    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: subTitle,
      buttons: [
        {
          text: this.translate.instant('OK'),
          handler: () => {},
        },
      ],
    });
    await alert.present();
  }
}
