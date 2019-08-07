import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {from, Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private readonly _syncSubject: Subject<boolean>;

    constructor() {
        this._syncSubject = new Subject<boolean>();

        this.db = new PouchDB(`${ENV.SF_PUBLIC_DB}_v2`);
        this._syncSubject.next(true);

        this.remote = `${ENV.DB_PROTOCOL}://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.SF_PUBLIC_DB}`;
        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
        }).on('paused', (err) => {
            this._syncSubject.next(true);
        }).on('error', (err) => {
            console.log('error');
            console.error(err);
        });
    }

    get syncSubject() {
        return this._syncSubject;
    }
}
