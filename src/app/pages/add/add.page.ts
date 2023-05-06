import { Component, OnDestroy, OnInit } from '@angular/core';
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
  filter,
  first,
  map,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { LocalDataService } from '@services/data/local-data.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
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
    private localDataService: LocalDataService
  ) {}

  async ngOnInit() {
    const splitUrl = this.router.url.split('/');
    this.addToFavorites = splitUrl[splitUrl.length - 2] === 'favorites';
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.router.navigate([currentUrl + '/shuttle/' + shuttle.id]);
  }

  /* Adding and removing from lists logic */
  public isInList$(shuttle: Shuttle): Observable<boolean> {
    if (!shuttle) {
      return of(false);
    }

    return combineLatest([this.favorites$, this.blacklisted$]).pipe(
      map(([favorites, blacklisted]) => {
        const list: Shuttle[] = this.addToFavorites ? favorites : blacklisted;
        return list.findIndex((s) => s && s.id && s.id === shuttle.id) > -1;
      })
    );
  }

  public async removeFromList(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.addToFavorites) {
      await this.localDataService.removeFavoriteShuttle(shuttle);
    } else {
      await this.localDataService.removeBlacklistedShuttle(shuttle);
    }
    await this.listsService.removeListElement(
      shuttle.id,
      this.addToFavorites ? ElementType.Favorites : ElementType.Blacklisted
    );
  }

  // TODO: extract add and remove from list
  public addToList(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();

    const type = this.addToFavorites
      ? ElementType.Favorites
      : ElementType.Blacklisted;
    this.authService.userId$
      .pipe(
        first(),
        withLatestFrom(
          this.addToFavorites ? this.blacklisted$ : this.favorites$
        ),
        filter(([userId, listToCheck]) => {
          if (!userId) {
            return false;
          }
          const alreadyInList =
            listToCheck.findIndex((e) => e.id === shuttle.id) >= 0;
          return !alreadyInList;
        }),
        tap(() => {
          if (this.addToFavorites) {
            this.localDataService.addFavoriteShuttle(shuttle);
          } else {
            this.localDataService.addBlacklistedShuttle(shuttle);
          }
        }),
        switchMap(([userId, listToCheck]) => {
          const listElement: ListElement = {
            id: `${userId}--${type}--${shuttle.id}`,
            userId: userId,
            shuttleId: shuttle.id,
            date: new Date().toISOString(),
            type: type,
          };
          return of(this.listsService.addListElement(listElement)).pipe(
            catchError((error) => {
              console.error(error);
              return of(null);
            })
          );
        }),
        filter(() => false),
        // We use filter to avoid calling presentAlreadyAddedInOtherListAlert() when the element is successfully added.
        tap(() => this.presentAlreadyAddedInOtherListAlert())
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
