import {Component, OnInit, OnDestroy} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Shuttle} from '@models/shuttle';
import {Router} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ListsService} from '@services/data/lists/lists.service';
import {ElementType, ListElement} from '@models/list-element';
import {List} from 'immutable';
import {AuthService} from '@services/auth/auth.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit, OnDestroy {
    private unsubscribe$ = new Subject<void>();
    addToFavorites: boolean;
    private unavailable: boolean;
    private noConnection: boolean;
    allShuttles: Shuttle[] = [];
    queryResult: Shuttle[] = [];
    resultIndex: number;
    favorites: List<ListElement> = List([]);
    blacklist: List<ListElement> = List([]);

    constructor(private navCtrl: NavController,
                private router: Router,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private authService: AuthService,
                private shuttlesService: ShuttlesService,
                public listsService: ListsService,
    ) {
    }

    async ngOnInit() {
        const splitUrl = this.router.url.split('/');
        this.addToFavorites = splitUrl[splitUrl.length - 2] === 'favorites';
        this.shuttlesService.allShuttles
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((data) => {
                this.allShuttles = data.toList().toArray();
                this.queryResult = this.allShuttles;
            });

        this.listsService.favorites
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((list) => {
                this.favorites = list;
            });
        this.listsService.blacklist
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((list) => {
                this.blacklist = list;
            });
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
        this.listsService.removeListElementByShuttleId(shuttle._id,
            this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted);
    }


    private async addToList(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        const listToCheck: List<ListElement> = this.addToFavorites ?
            this.blacklist :
            this.favorites;
        const userId = await this.authService.getUserId();
        const type = this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted;
        const listElement: ListElement = {
            _id: `${userId}--${type}--${shuttle._id}`,
            userId: userId,
            shuttleId: shuttle._id,
            date: new Date().toISOString(),
            type: type
        };
        if (listToCheck.findIndex(e => e.shuttleId === shuttle._id) < 0) {
            this.listsService.addListElement(listElement);
        } else {
            this.presentAlreadyAddedInOtherListAlert();
        }
    }

    // TODO: Refactor
    public isInList(shuttle: Shuttle): boolean {
        const list = this.addToFavorites ? this.favorites : this.blacklist;
        if (shuttle) {
            return list.findIndex(e => e && e.shuttleId && e.shuttleId === shuttle._id) > -1;
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
                        .replace('\'', '')
                        .indexOf(val.toLowerCase().replace(/\s/g, '')) > -1
                    || shuttle.phone
                        .toLowerCase()
                        .replace(/\s/g, '')
                        .replace('\'', '')
                        .indexOf(val.toLowerCase().replace(/\s/g, '')) > -1);
            });
        }
    }

    /* Alerts */
    private async presentAlreadyAddedInOtherListAlert() {
        const title = this.addToFavorites ?
            this.translate.instant('add.msg.ALREADY_ADDED_IN_BLACKLIST_TITLE') :
            this.translate.instant('add.msg.ALREADY_ADDED_IN_FAVORITES_TITLE');

        const subTitle = this.addToFavorites ?
            this.translate.instant('add.msg.ALREADY_ADDED_IN_BLACKLIST_SUBTITLE') :
            this.translate.instant('add.msg.ALREADY_ADDED_IN_FAVORITES_SUBTITLE');

        const alert = await this.alertCtrl.create({
            header: title,
            subHeader: subTitle,
            buttons: [{
                text: this.translate.instant('OK'),
                handler: () => {
                }
            }]
        });
        await alert.present();
    }
}
