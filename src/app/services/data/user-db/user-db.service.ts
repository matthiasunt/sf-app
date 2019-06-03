import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import PouchDB from 'pouchdb';

import {from, Observable, Subject} from 'rxjs';
import {ENV} from '@env';

@Injectable({
    providedIn: 'root'
})
export class UserDbService {

    public db: any;
    private remote: string;
    private details: any;
    private userId: string;
    private _syncSubject: Subject<boolean>;

    constructor(public http: HttpClient) {
        this.db = new PouchDB(ENV.SF_USER_DB);
        this._syncSubject = new Subject<boolean>();
    }

    public init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = ENV.production ? details.userDBs.prod_sf : details.userDBs.dev_sf;
        this.db.sync(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            // console.log(info);
            this._syncSubject.next(true);
        }).on('paused', (err) => {
            // console.log(err);
            this._syncSubject.next(true);
        }).on('error', (err) => {
            console.error(err);
            // Offline?
            this._syncSubject.next(true);
        });
    }

    public unableToLogin() {
        console.log('Unable to login!');
        this._syncSubject.next(true);
    }

    get syncSubject() {
        return this._syncSubject;
    }

    public getUserId() {
        return this.userId;
    }

    public getDoc(docId: any): Observable<any> {
        return from(this.db.get(docId));

    }

    public putDoc(doc: any): Observable<any> {
        return from(this.db.put(doc));
    }

    public updateDoc(doc: any): Observable<any> {
        return from(this.db.get(doc._id).then((docFromDb) => {
            if (docFromDb) {
                doc._rev = docFromDb._rev;
            }
            return from(this.putDoc(doc));
        }));
    }

    public removeDoc(doc: any): Observable<any> {
        doc._deleted = true;
        return this.updateDoc(doc);
    }
}
