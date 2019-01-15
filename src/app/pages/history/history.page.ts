import {Component} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {SfDbService} from '../../services/sf-db/sf-db.service';

@Component({
    selector: 'app-history',
    templateUrl: 'history.page.html',
    styleUrls: ['history.page.scss']
})
export class HistoryPage {
    history: any[][];

    constructor(private alertCtrl: AlertController,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService,
    ) {


    }

    private ionViewWillEnter() {
        this.localData.getHistory().then((history) => {
            const h = history.sort((a, b) => {
                return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
            });
            this.history = this.getGroupedHistory(h);
        });

    }

    private toCallPage(shuttle: any) {
        // this.navCtrl.push('Call', {
        //   shuttle: shuttle
        // });
    }


    async clearHistoryAlert() {
        const alert = await this.alertCtrl.create({
            header: '',
            subHeader: this.translate.instant('history.msg.DELETE_ALL'),
            buttons: [
                {
                    text: this.translate.instant('NO')
                },
                {
                    text: this.translate.instant('YES'),
                    handler: () => {
                        this.history = null;
                        // this.sfDb.clearCalls();
                        this.localData.clearShuttleHistory();
                    }
                }
            ]
        });
        await alert.present();
    }

    private getGroupedHistory(history: any[]): any[][] {
        const ret: any[][] = [];
        let j = 0;
        let k = 0;
        for (let i = 0; i < history.length; i++) {
            if (i === 0) {
                ret[j] = [];
                ret[j][k] = history[i];
            } else {
                if (this.getDate(history[i].date) != this.getDate(history[i - 1].date)) {
                    j++;
                    ret[j] = [];
                    k = 0;
                } else {
                    k++;
                }
                ret[j][k] = history[i];
            }
        }
        return ret;
    }


    getLocaleFromPrefLang(lang: string = this.localData.getPrefLang()): string {
        if (this.localData.getPrefLang()) {
            switch (this.localData.getPrefLang()) {
                case 'de':
                case 'de_st':
                    return 'de';
                case 'it':
                    return 'it';
                default:
                    return 'en';
            }
        } else {
            return this.translate.getBrowserLang();
        }
    }

    // Solve with a pipe?
    private getDate(dateString: string): string {
        let ret = new Date(dateString).toLocaleString(this.getLocaleFromPrefLang(),
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
        return ret;
    }

    private getTime(dateString: string): string {
        return new Date(dateString).toLocaleString(this.getLocaleFromPrefLang(),
            {
                hour: 'numeric',
                minute: 'numeric'
            });
    }
}
