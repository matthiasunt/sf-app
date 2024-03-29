import { inject, Injectable, NgZone } from '@angular/core';
import { App, AppState } from '@capacitor/app';
import { AuthService } from '@services/auth.service';

import { Call, CallOrigin } from '@models/call';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { AnalyticsEvent } from '../../logging/analytics-event';

@Injectable({
  providedIn: 'root',
})
export class CallsService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  /* To handle Call times */
  private afterCall: boolean;
  private lastCallShuttleId: string;
  private lastCallOrigin: CallOrigin;

  constructor(public zone: NgZone) {
    this.handleCalls();
  }

  public async setCallHandlerData(shuttleId: string, origin: CallOrigin) {
    this.lastCallShuttleId = shuttleId;
    this.lastCallOrigin = origin;
  }

  private async handleCalls() {
    let callStartDate: Date;
    let callEndDate: Date;
    const userId: string | undefined = await this.authService.userId$
      .pipe(take(1))
      .toPromise();
    if (userId && Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', async (state: AppState) => {
        if (state.isActive) {
          console.log('Resume');
          if (this.afterCall) {
            callEndDate = new Date();
            if (userId && this.lastCallShuttleId && this.lastCallOrigin) {
              const call: Call = {
                id: `${userId}--call--${callStartDate.toISOString()}--${
                  this.lastCallShuttleId
                }`,
                startDate: callStartDate,
                endDate: callEndDate,
                userId: userId,
                shuttleId: this.lastCallShuttleId,
                origin: this.lastCallOrigin,
              };
              await this.addCall(call);
              logEvent(getAnalytics(), AnalyticsEvent.CallEnded, call);
            } else {
              console.error('Call data invalid');
            }
            console.log(
              'Call time: ' +
                (callEndDate.getTime() - callStartDate.getTime()) / 1000
            );
            this.afterCall = false;
            this.lastCallOrigin = null;
            this.lastCallShuttleId = null;
          }
        } else {
          console.log('Pause');
          this.afterCall = true;
          callStartDate = new Date();
        }
      });
    }
  }

  private async addCall(call: Call) {
    try {
      await addDoc(
        collection(this.firestore, `shuttles/${call.shuttleId}/calls`),
        call
      );
    } catch (err) {
      console.error(err);
    }
  }
}
