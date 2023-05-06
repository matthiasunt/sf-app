import { ChangeDetectionStrategy, Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { CallsService } from '@services/data/calls.service';
import { LocalDataService } from '@services/data/local-data.service';

import { CallOriginName } from '@models/call';
import { Shuttle } from '@models/shuttle';
import { Observable, Subject } from 'rxjs';
import { HistoryElement } from '@models/history-element';
import { trackShuttleById } from '../../utils/track-by-id.utils';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  providers: [CallNumber],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  history$: Observable<HistoryElement[]> = this.localDataService.history;

  trackById(index: number, item: HistoryElement): number {
    return trackShuttleById(index, item.shuttle);
  }

  constructor(
    private navCtrl: NavController,
    private zone: NgZone,
    private router: Router,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private callNumber: CallNumber,
    public localDataService: LocalDataService,
    private callsService: CallsService
  ) {}

  async itemTapped(event: { shuttleId: string }) {
    await this.navCtrl.navigateForward(
      `tabs/history/shuttle/${event.shuttleId}`
    );
  }

  async rateTapped(event: { shuttleId: string }) {
    await this.navCtrl.navigateForward(`tabs/history/rate/${event.shuttleId}`);
  }

  async callTapped(event: { shuttle: Shuttle }) {
    await this.callsService.setCallHandlerData(event.shuttle.id, {
      name: CallOriginName.History,
      value: '',
    });
    await this.callNumber.callNumber(event.shuttle.phone, true);
    await this.localDataService.addToHistory({
      shuttle: event.shuttle,
      date: new Date(),
    });
  }

  public shouldShowHeader(
    history: HistoryElement[],
    item: HistoryElement,
    index: number
  ): Date | undefined {
    return index === 0 ||
      new Date(item.date).toDateString() !==
        new Date(history[index - 1].date).toDateString()
      ? item.date
      : undefined;
  }

  async clearHistoryAlert() {
    const alert = await this.alertCtrl.create({
      header: '',
      subHeader: this.translate.instant('history.msg.DELETE_ALL'),
      buttons: [
        { text: this.translate.instant('NO') },
        {
          text: this.translate.instant('YES'),
          handler: () => {
            this.localDataService.clearHistory();
          },
        },
      ],
    });
    await alert.present();
  }
}
