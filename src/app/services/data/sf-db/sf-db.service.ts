import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {from, Observable, Subject} from 'rxjs';
// PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));
@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private readonly _syncSubject: Subject<boolean>;

    constructor() {

        // this.db = new PouchDB('dev-shuttle-finder-public', {adapter: 'cordova-sqlite'});
        this.db = new PouchDB('dev-shuttle-finder-public');

        this._syncSubject = new Subject<boolean>();

        this.remote = ENV.DB_PROTOCOL + '://' + ENV.DB_USER + ':'
            + ENV.DB_PASS + '@' + ENV.DB_HOST + '/dev-shuttle-finder-public';

        console.log('db');
        console.log(this.db);
        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            console.log(info);
            console.log('change');
            // this._syncSubject.next(true);
        }).on('paused', (err) => {
            console.log(err);
            console.log('pause');
            // const res = this.db.allDocs();
            // console.log(res);
            this._syncSubject.next(true);
        }).on('error', (err) => {
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
