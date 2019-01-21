import {Component, OnInit} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {getBeatifulTimeString, getBeautifulDateString} from '../../tools/sf-tools';

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
        console.log(this.history);
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
        const locale = this.localData.getLocaleFromPrefLang();
        const actualDateString = getBeautifulDateString(record.date, locale);

        if (recordIndex === 0
            || getBeautifulDateString(records[recordIndex - 1].date, locale) !== actualDateString) {
            return actualDateString;
        }
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


}
