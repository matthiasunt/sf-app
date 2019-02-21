import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {List, Map} from 'immutable';
import {Call, CallOrigin, CallOriginName} from '../../../models/call';
import {UserDbService} from '../user-db/user-db.service';
import {AuthService} from '../../auth/auth.service';
import {HistoryElement} from '../../../models/history-element';
import {ShuttlesService} from '../shuttles/shuttles.service';
import {DeviceService} from '../../device/device.service';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class CallsService {

    private _calls: BehaviorSubject<List<Call>> = new BehaviorSubject(List([]));
    private _history: BehaviorSubject<List<HistoryElement>> = new BehaviorSubject(List([]));
    private afterCall: boolean;

    constructor(private deviceService: DeviceService,
                private platform: Platform,
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

    public handleCall(shuttleId: string, origin: CallOrigin) {

        if (this.deviceService.isDevice()) {
            let start: Date;
            let end: Date;

            this.platform.pause.subscribe(() => {
                console.log('Pause');
                start = new Date();
            });
            this.platform.resume.subscribe(() => {
                console.log('Resume');
                if (this.afterCall) {
                    end = new Date();
                    end.setSeconds(end.getSeconds() - 4);
                    const type = 'call';
                    const userId = this.authService.getUserId();
                    const call: Call = {
                        _id: `${userId}-${type}-${start}-${shuttleId}`,
                        type: type,
                        startDate: start,
                        endDate: end,
                        userId: userId,
                        shuttleId: shuttleId,
                        origin: origin,
                        isHidden: false,
                    };
                    this.addCall(call);
                    this.afterCall = false;
                }
            });
        } else {
            const type = 'call';
            const userId = this.authService.getUserId();
            const call: Call = {
                _id: `${userId}-${type}-${new Date().toISOString()}-${shuttleId}`,
                type: type,
                startDate: new Date(),
                endDate: new Date(),
                userId: userId,
                shuttleId: shuttleId,
                origin: origin,
                isHidden: false,
            };
            this.addCall(call);
        }
    }

    private async addCall(call: Call) {
        try {
            const res = await this.userDbService.db.put(call);
            this._calls.next(this._calls.getValue().push(call));
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }

    public hideCalls() {

    }

    private loadInitialData() {
        from(this.userDbService.db.query('calls/all', {include_docs: true}))
            .subscribe(
                (res: any) => {
                    const calls = res.rows.map(row => {
                        return row.doc;
                    });
                    console.log(calls);
                    this._calls.next(List(calls));
                    this.loadHistory();
                },
                err => console.log('Error retrieving Calls')
            );
    }

    private loadHistory() {
        this.calls.subscribe((calls) => {
            let history: List<HistoryElement> = List([]);
            calls.map((call: Call) => {
                const shuttle = this.shuttlesService.getShuttle(call.shuttleId);
                const historyElement: HistoryElement = {
                    shuttle: shuttle,
                    call: call,
                    date: call.startDate,
                };
                history = history.push(historyElement);
            });
            this._history.next(history);
        });
    }

    private emitCalls() {
        this.zone.run(() => {
            from(this.userDbService.db.query('calls/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        const calls = res.rows.map(row => {
                            return row.doc;
                        });
                        this._calls.next(List(calls));
                    },
                    err => console.log('Error retrieving Calls')
                );
        });
    }
}
