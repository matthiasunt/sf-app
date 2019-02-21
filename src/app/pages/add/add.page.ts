import {Component, OnInit} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/data/sf-db/sf-db.service';
import {LocalDataService} from '../../services/data/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';
import {getFormattedPhoneNumber} from '../../tools/sf-tools';
import {Router} from '@angular/router';
import {ShuttlesService} from '../../services/data/shuttles/shuttles.service';
import {ListsService} from '../../services/data/lists/lists.service';
import {ElementType, ListElement} from '../../models/list-element';
import {List} from 'immutable';
import {AuthService} from '../../services/auth/auth.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

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
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGenerator: ColorGeneratorService
    ) {
    }

    async ngOnInit() {
        const splitUrl = this.router.url.split('/');
        this.addToFavorites = splitUrl[splitUrl.length - 2] === 'favorites';
        this.shuttlesService.allShuttles.subscribe((data) => {
            this.allShuttles = data.toList().toArray();
            this.queryResult = this.allShuttles;
        });

        this.listsService.favorites.subscribe((list) => {
            this.favorites = list;
        });
        this.listsService.blacklist.subscribe((list) => {
            this.blacklist = list;
        });
        this.resultIndex = 0;
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
        const type = this.addToFavorites ? ElementType.Favorite : ElementType.Blacklisted;
        const listElement: ListElement = {
            _id: `${this.authService.getUserId()}-${type}-${shuttle._id}`,
            userId: this.authService.getUserId(),
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


    public isInList(shuttle: Shuttle): boolean {
        const list = this.addToFavorites ? this.favorites : this.blacklist;
        if (shuttle) {
            if (list.findIndex(e => e.shuttleId === shuttle._id) < 0) {
                return false;
            } else {
                return true;
            }
        }
    }

    public getShuttleColor(shuttle: Shuttle) {
        if (shuttle) {
            return this.colorGenerator.getShuttleColor(shuttle);
        }
    }

    public getPhoneNumber(shuttle: Shuttle) {
        if (shuttle) {
            return getFormattedPhoneNumber(shuttle.phone);
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
