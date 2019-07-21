import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {from, Observable, Subject} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {CouchDoc} from '@models/couch-doc';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private readonly _syncSubject: Subject<boolean>;

    constructor() {
        this.db = new PouchDB(`${ENV.SF_PUBLIC_DB}_v2`);

        this._syncSubject = new Subject<boolean>();
        this._syncSubject.next(true);

        this.remote = `${ENV.DB_PROTOCOL}://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.SF_PUBLIC_DB}`;
        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
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

    public updateDoc(doc: any): Observable<any> {
        return from(this.db.get(doc._id)).pipe(
            mergeMap((oldDoc: CouchDoc) => {
                doc._rev = oldDoc._rev;
                return from(this.putDoc(doc));
            }));
    }

    public removeDoc(doc: any): Observable<any> {
        doc._deleted = true;
        return this.updateDoc(doc);
    }

}
