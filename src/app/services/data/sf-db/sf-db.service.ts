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
        this.db = new PouchDB(ENV.SF_PUBLIC_DB);

        this._syncSubject = new Subject<boolean>();

        this.remote = `${ENV.DB_PROTOCOL}://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.SF_PUBLIC_DB}`;
        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            console.log('change');
            // console.log(info);
            // this._syncSubject.next(true);
        }).on('paused', (err) => {
            console.log('pause');
            // console.log(err);
            this._syncSubject.next(true);
        }).on('denied', (err) => {
            console.log('Denied');
            // console.log(err);
        }).on('error', (err) => {
            console.log('Error');
            console.error(err);
            // If offline
            this._syncSubject.next(true);
        });

        this.db.info().then(function (info) {
            console.log(info);
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
