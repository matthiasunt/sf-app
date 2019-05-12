import {Component, NgZone, OnInit, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {AlertController, NavController} from '@ionic/angular';
import {CallNumber} from '@ionic-native/call-number/ngx';

import {CallsService} from '@services/data/calls/calls.service';
import {LocalDataService} from '@services/data/local-data/local-data.service';

import {CallOriginName} from '@models/call';
import {Shuttle} from '@models/shuttle';
import {getBeautifulDateString, getBeautifulTimeString} from '../../tools/sf-tools';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-history',
    templateUrl: 'history.page.html',
    styleUrls: ['history.page.scss'],
    providers: [CallNumber],
})
export class HistoryPage implements OnInit, OnDestroy {

    private unsubscribe$ = new Subject<void>();
    locale: string;
    history;

    constructor(private navCtrl: NavController,
                private zone: NgZone,
                private router: Router,
                private alertCtrl: AlertController,
                private translate: TranslateService,
                private callNumber: CallNumber,
                public localDataService: LocalDataService,
                private callsService: CallsService,
    ) {
    }

    async ngOnInit() {
    }

    ngOnDestroy() {
        console.log('Destroyed');
    }

    async ionViewWillEnter() {

        this.localDataService.history
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((history) => {
                this.history = history.toArray();
            });
        this.localDataService.lang
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((lang) => this.locale = lang === 'de_st' ? 'de' : lang);
    }

    ionViewWillLeave() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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
        this.callsService.setCallHandlerData(shuttle._id, {
            name: CallOriginName.History, value: ''
        });
        this.callNumber.callNumber(shuttle.phone, true);
        this.localDataService.addToHistory({shuttle, date: new Date()});
    }

    public myHeaderFn(record, recordIndex, records) {
        if (recordIndex === 0
            || new Date(record.date).toDateString() !== new Date(records[recordIndex - 1].date).toDateString()) {
            return record.date;
        }
        return null;
    }

    getTime(date: string) {
        return getBeautifulTimeString(date, this.locale);
    }

    getDate(date: string) {
        return getBeautifulDateString(date, this.locale);
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
                        this.callsService.hideCalls();
                        this.localDataService.clearHistory();
                    }
                }
            ]
        });
        await alert.present();
    }


}
