import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {from, fromEvent, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private readonly _syncSubject: Subject<boolean>;

    constructor() {
        this.db = new PouchDB(ENV.SF_PUBLIC_DB);

        this._syncSubject = new Subject<boolean>();
        this._syncSubject.next(true);

        this.remote = `${ENV.DB_PROTOCOL}://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.SF_PUBLIC_DB}`;
        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            this._syncSubject.next(true);
        }).on('paused', (err) => {
            this._syncSubject.next(true);
        }).on('error', (err) => {
            this._syncSubject.next(true);
            console.log('Error');
            console.error(err);
        });
    }

    get syncSubject() {
        return this._syncSubject;
    }


    public getDoc(docId: any): Observable<any> {
        return from(this.db.get(docId));

    }

    public putDoc(doc: any): Observable<any> {
        return from(this.db.put(doc));
    }

    public updateDoc(doc: any) {
        this.db.get(doc._id).then((docFromDb) => {
            if (docFromDb) {
                doc._rev = docFromDb._rev;
            }
            return from(this.putDoc(doc));
        });
    }

    public removeDoc(doc: any) {
        doc._deleted = true;
        return this.updateDoc(doc);
    }

}
