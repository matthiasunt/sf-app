import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import PouchDB from 'pouchdb';

import {Subject} from 'rxjs';
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
        this.db = new PouchDB('sf-private', {auto_compaction: true});
        this._syncSubject = new Subject<boolean>();
    }

    public init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = ENV.production ? details.userDBs.sf : details.userDBs.dev_sf;
        this.db.sync(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            this._syncSubject.next(true);
        }).on('paused', (err) => {
            this._syncSubject.next(true);
        }).on('complete', (info) => {
            this._syncSubject.next(true);
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

    public async getDoc(docId: any) {
        try {
            return await this.db.get(docId);
        } catch (err) {
            console.error(err);
        }
    }

    public async putDoc(doc: any) {
        try {
            const res = await this.db.put(doc);
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }

    public async updateDoc(doc: any) {
        try {
            const docFromDb = await this.db.get(doc._id);
            if (docFromDb) {
                doc._rev = docFromDb._rev;
            }
            await this.putDoc(doc);
        } catch (err) {
            console.error(err);
        }
    }

    public async removeDoc(doc: any) {
        doc._deleted = true;
        await this.updateDoc(doc);
    }
}
