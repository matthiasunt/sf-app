import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {List} from 'immutable';

import {UserDbService} from '../user-db/user-db.service';
import {AuthService} from '../../auth/auth.service';
import {ShuttlesService} from '../shuttles/shuttles.service';
import {DeviceService} from '../../device/device.service';

import {Call, CallOrigin} from '../../../models/call';
import {HistoryElement} from '../../../models/history-element';
import {Plugins, AppState} from '@capacitor/core';

const {App} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class CallsService {

    private _calls: BehaviorSubject<List<Call>> = new BehaviorSubject(List([]));
    private _history: BehaviorSubject<List<HistoryElement>> = new BehaviorSubject(List([]));
    private afterCall: boolean;

    constructor(private deviceService: DeviceService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
                private authService: AuthService,
                public zone: NgZone) {
        this.loadInitialData();
        this.userDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
            if (change.doc.type === 'call') {
                this.emitCalls();
            }
        });
    }

    get calls() {
        this.emitCalls();
        return this._calls;
    }

    get history() {
        return this._history;
    }

    // TODO: Fix Handler!!
    public handleCall(shuttleId: string, origin: CallOrigin) {
        let callStartDate: Date;
        let callEndDate: Date;
        const type = 'call';
        const userId = this.authService.getUserId();

        if (this.deviceService.isDevice()) {
            // App.addListener('appStateChange', (state: AppState) => {
            //     if (state.isActive) {
            //         console.log('Resume');
            //         if (this.afterCall) {
            //             callEndDate = new Date();
            //             // callEndDate.setSeconds(callEndDate.getSeconds() - 4);
            //             const call: Call = {
            //                 _id: `${userId}-${type}-${callStartDate.toISOString()}-${shuttleId}`,
            //                 type: type,
            //                 startDate: callStartDate,
            //                 endDate: callEndDate,
            //                 userId: userId,
            //                 shuttleId: shuttleId,
            //                 origin: origin,
            //                 isHidden: false,
            //             };
            //             this.addCall(call);
            //             this.afterCall = false;
            //         }
            //     } else {
            //         console.log('Pause');
            //         callStartDate = new Date();
            //         this.afterCall = true;
            //     }
            // });
        } else {
            callStartDate = new Date();
            callEndDate = new Date();
            this.addCall({
                _id: `${userId}-${type}-${callStartDate.toISOString()}-${shuttleId}`,
                type: type,
                startDate: callStartDate,
                endDate: callEndDate,
                userId: userId,
                shuttleId: shuttleId,
                origin: origin,
                isHidden: false,
            });
        }
    }

    private async addCall(call: Call) {
        try {
            this._calls.next(this._calls.getValue().push(call));
            const res = await this.userDbService.db.put(call);
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }

    public hideCalls() {
        const callsToHide = this._calls.getValue();
        this._calls.next(List([]));
        this._history.next(List([]));

        console.log(callsToHide);
        callsToHide.map((call: Call) => {
            if (call) {
                call.isHidden = true;
            }
            try {
                // const res = this.userDbService.updateDoc(call);
                // console.log(res);
            } catch (err) {
                console.error(err);
            }
        });

    }

    private loadInitialData() {
        this.userDbService.syncSubject.subscribe(() => {
            from(this.userDbService.db.query('calls/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        const calls = res.rows.map(row => {
                            if (!row.doc.isHidden) {
                                return row.doc;
                            }
                        });
                        this._calls.next(List(calls));
                        this.loadHistory();
                    },
                    (err) => console.log('Error retrieving Calls')
                );
        });
    }

    private loadHistory() {
        this.calls.subscribe((calls) => {
            let history: List<HistoryElement> = List([]);
            calls.map((call: Call) => {
                if (call && call.shuttleId) {
                    const shuttle = this.shuttlesService.getShuttle(call.shuttleId);
                    const historyElement: HistoryElement = {
                        shuttle: shuttle,
                        call: call,
                        date: call.startDate,
                    };
                    history = history.push(historyElement);
                }
            });
            this._history.next(history.reverse());
        });
    }

    private emitCalls() {
        // this.zone.run(() => {
            from(this.userDbService.db.query('calls/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        const calls = res.rows.map(row => {
                            if (!row.doc.isHidden) {
                                return row.doc;
                            }
                        });
                        this._calls.next(List(calls));
                    },
                    err => console.log('Error retrieving Calls')
                );
        // });
    }
}
