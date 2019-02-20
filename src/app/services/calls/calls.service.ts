import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {List, Map} from 'immutable';
import {Call} from '../../models/call';
import {Shuttle} from '../../models/shuttle';
import {SfDbService} from '../sf-db/sf-db.service';
import {DistrictsService} from '../districts/districts.service';
import {ElementType} from '../../models/list-element';

@Injectable({
    providedIn: 'root'
})
export class CallsService {

    private _calls: BehaviorSubject<List<Call>> = new BehaviorSubject(List([]));

    constructor(private sfDbService: SfDbService,
                public zone: NgZone) {
        this.sfDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
            if (change.doc.type === 'call') {
                this.emitCalls();
            }
        });
    }

    get calls() {
        this.emitCalls();
        return this._calls;
    }

    public addCall(call: Call) {
        const obs = this.sfDbService.db.put(call);
        obs.subscribe(
            res => {
                this._calls.next(this._calls.getValue().push(call));
            }
        );
        return obs;
    }

    public hideCalls() {

    }

    private loadInitialData() {
        from(this.sfDbService.db.query('calls/all', {include_docs: true}))
            .subscribe(
                (res: any) => {
                    let calls: List<Call> = List([]);
                    res.rows.map(row => {
                        calls = calls.set(row.doc._id, row.doc);
                    });
                    this._calls.next(calls);
                },
                err => console.log('Error retrieving Calls')
            );
    }

    private emitCalls() {
        this.zone.run(() => {
            this.sfDbService.db.query('calls/all').then((data) => {
                const calls = data.rows.map(row => {
                    return row.value;
                });
                this._calls.next(calls);

            });

        });
    }
}
