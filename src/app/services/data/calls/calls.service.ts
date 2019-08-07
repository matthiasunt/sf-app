import {Injectable, NgZone} from '@angular/core';

import {UserDbService} from '@services/data/user-db/user-db.service';
import {AuthService} from '@services/auth/auth.service';
import {DeviceService} from '@services/device/device.service';

import {Call, CallOrigin} from '@models/call';

import {DocType} from '@models/doctype';
import {AppState, Plugins} from '@capacitor/core';
import {LocalDataService} from '@services/data/local-data/local-data.service';

const {App} = Plugins;


@Injectable({
    providedIn: 'root'
})
export class CallsService {

    /* To handle Call times */
    private afterCall: boolean;
    private lastCallShuttleId: string;
    private lastCallOrigin: CallOrigin;

    constructor(private deviceService: DeviceService,
                private localDataService: LocalDataService,
                private authService: AuthService,
                private userDbService: UserDbService,
                public zone: NgZone) {
        this.handleCalls();
    }

    public async setCallHandlerData(shuttleId: string, origin: CallOrigin) {
        this.lastCallShuttleId = shuttleId;
        this.lastCallOrigin = origin;
        /* Only for testing */
        if (!(await this.deviceService.isDevice())) {
            const userId = await this.authService.getUserId();
            this.addCall({
                _id: `${userId}--${DocType.Call}--${new Date().toISOString()}--${this.lastCallShuttleId}`,
                type: DocType.Call,
                startDate: new Date(),
                endDate: new Date(),
                userId: userId,
                shuttleId: this.lastCallShuttleId,
                origin: this.lastCallOrigin,
                isHidden: false,
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
                                _id: `${userId}--${DocType.Call}--${callStartDate.toISOString()}--${this.lastCallShuttleId}`,
                                type: DocType.Call,
                                startDate: callStartDate,
                                endDate: callEndDate,
                                userId: userId,
                                shuttleId: this.lastCallShuttleId,
                                origin: this.lastCallOrigin,
                                isHidden: false,
                            };
                            await this.addCall(call);
                        } else {
                            console.error('Call data invalid');
                        }
                        console.log('Call time: ' + (callEndDate.getTime() - callStartDate.getTime()) / 1000);
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

    private addCall(call: Call) {
        return this.userDbService.putDoc(call);
    }
}
