import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Shuttle } from '@models/shuttle';
import { Router } from '@angular/router';
import { ShuttlesService } from '@services/data/shuttles.service';
import { ListsService } from '@services/data/lists.service';
import { ElementType, ListElement } from '@models/list-element';

import { AuthService } from '@services/auth.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject, of, lastValueFrom } from 'rxjs';
import { LocalDataService } from '@services/data/local-data.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  addToFavorites: boolean;
  allShuttles: Shuttle[] = [];
  queryResult: Shuttle[] = [];
  resultIndex: number;

  favoriteShuttles: Shuttle[] = [];
  blacklistedShuttles: Shuttle[] = [];

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
    this.shuttlesService.allShuttles
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((shuttles) => {
        this.allShuttles = shuttles;
        this.queryResult = this.allShuttles;
      });

    this.localDataService.favoriteShuttles.subscribe(
      (shuttles) => (this.favoriteShuttles = shuttles)
    );
    this.localDataService.blacklistedShuttles.subscribe(
      (shuttles) => (this.blacklistedShuttles = shuttles)
    );
    this.resultIndex = 0;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public shuttleClicked(shuttle: Shuttle) {
    const currentUrl = this.router.url;
    this.router.navigate([currentUrl + '/shuttle/' + shuttle.id]);
  }

  public removeFromList(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.addToFavorites) {
      this.localDataService.removeFavoriteShuttle(shuttle);
    } else {
      this.localDataService.removeBlacklistedShuttle(shuttle);
    }
    this.listsService.removeListElementByShuttleId(
      shuttle.id,
      this.addToFavorites ? ElementType.Favorites : ElementType.Blacklisted
    );
  }

  private async addToList(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    const listToCheck: Shuttle[] = this.addToFavorites
      ? this.blacklistedShuttles
      : this.favoriteShuttles;
    const userId: string | undefined = await this.authService.userId
      .pipe(take(1))
      .toPromise();
    if (userId) {
      const type = this.addToFavorites
        ? ElementType.Favorites
        : ElementType.Blacklisted;
      const listElement: ListElement = {
        id: `${userId}--${type}--${shuttle.id}`,
        userId: userId,
        shuttleId: shuttle.id,
        date: new Date().toISOString(),
        type: type,
      };
      if (listToCheck.findIndex((e) => e.id === shuttle.id) < 0) {
        if (this.addToFavorites) {
          this.localDataService.addFavoriteShuttle(shuttle);
        } else {
          this.localDataService.addBlacklistedShuttle(shuttle);
        }
        this.listsService.addListElement(listElement);
      } else {
        this.presentAlreadyAddedInOtherListAlert();
      }
    }
  }

  public isInList(shuttle: Shuttle): boolean {
    const list: Shuttle[] = this.addToFavorites
      ? this.favoriteShuttles
      : this.blacklistedShuttles;
    if (shuttle) {
      return list.findIndex((s) => s && s.id && s.id === shuttle.id) > -1;
    }
  }

  public getQueryResult(ev: any) {
    this.queryResult = this.allShuttles;
    const val = ev.target.value;
    if (!val) {
      return;
    } else if (this.queryResult) {
      this.queryResult = this.allShuttles.filter((shuttle) => {
        return (
          shuttle.name
            .toLowerCase()
            .replace(/\s/g, '')
            .replace("'", '')
            .indexOf(val.toLowerCase().replace(/\s/g, '')) > -1 ||
          shuttle.phone
            .toLowerCase()
            .replace(/\s/g, '')
            .replace("'", '')
            .indexOf(val.toLowerCase().replace(/\s/g, '')) > -1
        );
      });
    }
  }

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
