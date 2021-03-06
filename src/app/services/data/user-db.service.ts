import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import PouchDB from 'pouchdb';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {ENV} from '@env';
import {mergeMap} from 'rxjs/operators';
import {CouchDoc} from '@models/couch-doc';

@Injectable({
    providedIn: 'root'
})
export class UserDbService {

    public db: any;
    private remote: string;
    private details: any;
    private userId: string;
    private _syncSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(public http: HttpClient) {
        this.db = new PouchDB(ENV.SF_USER_DB);
        this._syncSubject.next(true);
    }

    public init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = ENV.production ? details.userDBs.prod_sf : details.userDBs.dev_sf;
        this.db.replicate.from(this.remote)
            .on('complete', (info) => {
                this.db.sync(this.remote, {
                    retry: true, live: true
                }).on('paused', (err) => {
                    this._syncSubject.next(true);
                });
            }).on('error', (err) => {
            console.error(err);
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
