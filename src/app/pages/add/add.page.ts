import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Shuttle } from '@models/shuttle';
import { Router } from '@angular/router';
import { ShuttlesService } from '@services/data/shuttles.service';
import { ListsService } from '@services/data/lists.service';
import { ElementType, ListElement } from '@models/list-element';
import { List } from 'immutable';
import { AuthService } from '@services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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

  favoriteShuttles: List<Shuttle> = List([]);
  blacklistedShuttles: List<Shuttle> = List([]);

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
        this.allShuttles = shuttles.toArray();
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
    this.router.navigate([currentUrl + '/shuttle/' + shuttle._id]);
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
      shuttle._id,
      this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted
    );
  }

  private async addToList(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    const listToCheck: List<Shuttle> = this.addToFavorites
      ? this.blacklistedShuttles
      : this.favoriteShuttles;
    const userId = await this.authService.getUserId();
    const type = this.addToFavorites
      ? ElementType.Favorite
      : ElementType.Blacklisted;
    const listElement: ListElement = {
      _id: `${userId}--${type}--${shuttle._id}`,
      userId: userId,
      shuttleId: shuttle._id,
      date: new Date().toISOString(),
      type: type,
    };
    if (listToCheck.findIndex((e) => e._id === shuttle._id) < 0) {
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

  public isInList(shuttle: Shuttle): boolean {
    const list: List<Shuttle> = this.addToFavorites
      ? this.favoriteShuttles
      : this.blacklistedShuttles;
    if (shuttle) {
      return list.findIndex((s) => s && s._id && s._id === shuttle._id) > -1;
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
