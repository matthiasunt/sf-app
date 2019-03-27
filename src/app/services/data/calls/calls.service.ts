import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {List} from 'immutable';

import {UserDbService} from '@services/data/user-db/user-db.service';
import {AuthService} from '@services/auth/auth.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {DeviceService} from '@services/device/device.service';

import {Call, CallOrigin} from '@models/call';
import {HistoryElement} from '@models/history-element';

import {DocType} from '@models/doctype';
import {AppState, Plugins} from '@capacitor/core';
import {LocalDataService} from '@services/data/local-data/local-data.service';

const {App} = Plugins;


@Injectable({
    providedIn: 'root'
})
export class CallsService {

    private _calls: BehaviorSubject<List<Call>> = new BehaviorSubject(List([]));
    private _history: BehaviorSubject<List<HistoryElement>> = new BehaviorSubject(List([]));

    /* To handle Call times */
    private afterCall: boolean;
    private lastCallShuttleId: string;
    private lastCallOrigin: CallOrigin;

    constructor(private deviceService: DeviceService,
                private localDataService: LocalDataService,
                private authService: AuthService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
                public zone: NgZone) {
        this.loadInitialData();

        // this.userDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        //     if (change.doc.type === DocType.Call) {
        //         this.emitCalls();
        //     }
        // });

        this.handleCalls();
    }

    get calls() {
        this.emitCalls();
        return this._calls;
    }

    get history() {
        return this._history;
    }

    // public getHistoryFromCalls(calls: List<Call>) {
    //     let ret: List<HistoryElement> = List();
    //     calls.map((call: Call) => {
    //         if (call && call.shuttleId) {
    //             const shuttle = this.shuttlesService.allShuttles.getValue().get(call.shuttleId);
    //             if (shuttle) {
    //                 const historyElement: HistoryElement = {
    //                     shuttle: shuttle,
    //                     // call: call,
    //                     date: call.startDate,
    //                 };
    //                 ret = ret.push(historyElement);
    //             }
    //         }
    //     });
    //     return ret.reverse();
    // }

    /**
     *
     */
    public hideCalls() {
        const callsToHide = this._calls.getValue();
        this._calls.next(List([]));
        this._history.next(List([]));
        callsToHide.map(async (call: Call) => {
            if (call && call._id) {
                call.isHidden = true;
                await this.userDbService.updateDoc(call);
            }
        });

    }

    /**
     *
     * @param shuttleId
     * @param origin
     */
    public async setCallHandlerData(shuttleId: string, origin: CallOrigin) {
        this.lastCallShuttleId = shuttleId;
        this.lastCallOrigin = origin;
        /* Only for testing */
        if (!(await this.deviceService.isDevice())) {
            const userId = await this.authService.getUserId();
            this.addCall({
                _id: `${userId}-${DocType.Call}-${new Date().toISOString()}-${this.lastCallShuttleId}`,
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

    /**
     * Puts new Calls automatically
     */
    private async handleCalls() {
        let callStartDate: Date;
        let callEndDate: Date;
        const userId = await this.authService.getUserId();
        if (await this.deviceService.isDevice()) {
            App.addListener('appStateChange', async (state: AppState) => {
                if (state.isActive) {
                    if (this.afterCall) {
                        callEndDate = new Date();
                        if (userId) {
                            const call: Call = {
                                _id: `${userId}-${DocType.Call}-${callStartDate.toISOString()}-${this.lastCallShuttleId}`,
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
                            console.log('No User Id!');
                        }
                        console.log('Call time: ' + (callEndDate.getTime() - callStartDate.getTime()) / 1000);

                        this.afterCall = false;
                    }
                } else {
                    callStartDate = new Date();
                    this.afterCall = true;
                }
            });
        }
    }

    private async addCall(call: Call) {
        this._calls.next(this._calls.getValue().push(call));
        await this.userDbService.db.put(call);
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
                    },
                    (err) => console.log('Error retrieving Calls')
                );
        });
    }

    private emitCalls() {
        this.zone.run(() => {
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
        });
    }
}
