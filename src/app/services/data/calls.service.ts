import { Injectable, NgZone } from '@angular/core';
import { App, AppState } from '@capacitor/app';
import { AuthService } from '@services/auth.service';
import { DeviceService } from '@services/device.service';

import { Call, CallOrigin } from '@models/call';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class CallsService {
  private db = getFirestore(getApp());

  /* To handle Call times */
  private afterCall: boolean;
  private lastCallShuttleId: string;
  private lastCallOrigin: CallOrigin;

  constructor(
    private deviceService: DeviceService,
    private authService: AuthService,
    public zone: NgZone
  ) {
    this.handleCalls();
  }

  public async setCallHandlerData(shuttleId: string, origin: CallOrigin) {
    this.lastCallShuttleId = shuttleId;
    this.lastCallOrigin = origin;
    /* Only for testing */
    if (!(await this.deviceService.isDevice())) {
      const userId = await this.authService.getUserId();
      this.addCall({
        id: `${userId}--call--${new Date().toISOString()}--${
          this.lastCallShuttleId
        }`,
        startDate: new Date(),
        endDate: new Date(),
        userId: userId,
        shuttleId: this.lastCallShuttleId,
        origin: this.lastCallOrigin,
      });
    }
  }

  private async handleCalls() {
    let callStartDate: Date;
    let callEndDate: Date;
    const userId = await this.authService.getUserId();
    if (await this.deviceService.isDevice()) {
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
    const res = await setDoc(
      doc(this.db, `shuttles/${call.shuttleId}/calls/${call.id}`),
      call
    );
    console.info(res);
  }
}
