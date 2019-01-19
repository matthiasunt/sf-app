import {Component, OnInit} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';

@Component({
    selector: 'app-history',
    templateUrl: 'history.page.html',
    styleUrls: ['history.page.scss']
})
export class HistoryPage implements OnInit {
    history: any[][];

    constructor(private router: Router,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService,
    ) {
    }

    async ngOnInit() {
        this.history = await this.localData.getHistory();
    }

    rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.router.navigate([currentUrl + '/rate/' + shuttle._id]);
    }

    private ionViewWillEnter() {
        // this.localData.getHistory().then((history) => {
        //     const h = history.sort((a, b) => {
        //         return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
        //     });
        //     this.history = this.getGroupedHistory(h);
        // });

    }

    private toCallPage(shuttle: any) {
        // this.navCtrl.push('Call', {
        //   shuttle: shuttle
        // });
    }

    myHeaderFn(record, recordIndex, records) {
        if (recordIndex === 0
            || this.getDate(records[recordIndex - 1].date) !== this.getDate(record.date)) {
            return this.getDate(record.date);
        }
    }

    // Solve with a pipe?
    private getDate(dateString: string): string {
        let ret = new Date(dateString).toLocaleString(this.getLocaleFromPrefLang(),
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        ret = ret.charAt(0).toUpperCase() + ret.slice(1);
        return ret;
    }


    async clearHistoryAlert() {
        const alert = await this.alertCtrl.create({
            header: '',
            subHeader: this.translate.instant('history.msg.DELETE_ALL'),
            buttons: [
                {text: this.translate.instant('NO')},
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

    private getTime(dateString: string): string {
        return new Date(dateString).toLocaleString(this.getLocaleFromPrefLang(),
            {
                hour: 'numeric',
                minute: 'numeric'
            });
    }
}
