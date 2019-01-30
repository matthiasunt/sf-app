import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {getBeautifulTimeString, getBeautifulDateString} from '../../tools/sf-tools';
import {AlertController, NavController} from '@ionic/angular';
import {CallNumber} from '@ionic-native/call-number/ngx';

@Component({
    selector: 'app-history',
    templateUrl: 'history.page.html',
    styleUrls: ['history.page.scss'],
    providers: [CallNumber],
})
export class HistoryPage implements OnInit {
    history: any[];
    locale: string;

    constructor(private navCtrl: NavController,
                private router: Router,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private callNumber: CallNumber,
                public localData: LocalDataService,
                public colorGeneratorService: ColorGeneratorService,
    ) {
        this.history = [];
    }

    async ngOnInit() {
        this.history = await this.localData.getHistory();
        this.locale = this.localData.getLocaleFromPrefLang();
    }

    private shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('tabs/history/shuttle/' + shuttle._id);
    }

    private rateClicked(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        this.navCtrl.navigateForward('tabs/history/rate/' + shuttle._id);
    }

    private callClicked(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        this.localData.addShuttleToHistory(shuttle);
        this.callNumber.callNumber(shuttle.phone, true);
    }

    getTime(date: string) {
        return getBeautifulTimeString(date, this.locale);
    }

    getDate(date: string) {
        return getBeautifulDateString(date, this.locale);
    }

    myHeaderFn(record, recordIndex, records) {
        if (recordIndex === 0
            || new Date(record.date).toDateString() !== new Date(records[recordIndex - 1].date).toDateString()) {
            return getBeautifulDateString(record.date, 'de');
        }
        return null;
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
