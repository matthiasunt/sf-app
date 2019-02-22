import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private _syncSubject: Subject<boolean>;

    constructor() {

        this.db = new PouchDB('sf-public');
        this._syncSubject = new Subject<boolean>();

        this.remote = ENV.DB_PROTOCOL + '://' + ENV.DB_USER + ':'
            + ENV.DB_PASS + '@' + ENV.DB_HOST + '/sf-public';

        this.db.replicate.from(this.remote, {
            retry: true
        }).on('complete', (info) => {
            this._syncSubject.next(true);
        }).on('error', (err) => {
            console.error(err);
        });
    }

    get syncSubject() {
        return this._syncSubject;
    }

    private buildRankingFromLocationInRanges(arr: any[], radius: number): any {
        const range1: string[] = [];
        const range2: string[] = [];
        const range3: string[] = [];
        arr.forEach((e) => {
            if (e.distance) {
                if (e.distance < 12000) {
                    range1.push(e);
                } else if (e.distance < 25000) {
                    range2.push(e);
                } else {
                    range3.push(e);
                }
            }
        });
        return {
            ranges: [
                {
                    distance: 12000,
                    shuttles: range1.sort(() => Math.random() - 0.5)
                },
                {
                    distance: 25000,
                    shuttles: range2.sort(() => Math.random() - 0.5)
                },
                {
                    distance: radius,
                    shuttles: range3.sort(() => Math.random() - 0.5)
                }
            ]
        };

    }

}
