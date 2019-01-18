import {Component, OnInit} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';
import {getIndexOfShuttle} from '../../tools/sf-tools';
import {Router} from '@angular/router';

@Component({
    selector: 'app-add',
    templateUrl: './add.page.html',
    styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

    addToFavorites: boolean;
    private unavailable: boolean;
    private noConnection: boolean;
    private allShuttles: any[];
    private queryResult: any[];
    private resultIndex: number;
    private list: any[];

    constructor(private router: Router,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGenerator: ColorGeneratorService
    ) {
    }

    async ngOnInit() {
        const splitUrl = this.router.url.split('/');
        this.addToFavorites = splitUrl[splitUrl.length - 2] === 'favorites';
        this.allShuttles = await this.sfDb.getAllShuttles();
        this.queryResult = this.allShuttles;

        if (this.addToFavorites) {
            this.list = await this.localData.getFavorites();
        } else {
            this.list = await this.localData.getBlacklist();
        }
        this.resultIndex = 0;
    }

    private removeFromList(shuttle: Shuttle) {
        const index = getIndexOfShuttle(this.list, shuttle);
        if (index !== -1) {
            if (this.addToFavorites) {
                this.localData.removeShuttleFromFavorites(shuttle);
            } else {
                this.localData.removeShuttleFromBlacklist(shuttle);
            }
        } else {
            console.log('shuttle not found');
        }
    }


    private async addToList(shuttle: Shuttle) {
        const listToCheck = this.addToFavorites ?
            this.localData.getBlacklist() :
            this.localData.getFavorites();
        const index = getIndexOfShuttle(listToCheck, shuttle);
        if (index === -1) {
            if (this.addToFavorites) {
                this.localData.addFavorite(shuttle);
            } else {
                this.localData.addBlacklisted(shuttle);
            }
        } else {
            // Shuttle already in other list
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


    private getCityName(shuttle: Shuttle): string {
        if (shuttle &&
            shuttle.city
            && shuttle.city.de && shuttle.city.it) {
            switch (this.localData.getPrefLang()) {
                case 'de_st':
                    return shuttle.city.de;
                case 'it':
                    return shuttle.city.it;
                default:
                    return shuttle.city.de;
            }
        }
    }

    private isInList(shuttle: Shuttle): boolean {
        if (getIndexOfShuttle(this.list, shuttle) === -1) {
            return false;
        } else {
            return true;
        }
    }

    private getQueryResult(ev: any) {
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

}
