import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import PouchDB from 'pouchdb';
import {Subject} from 'rxjs';

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
        this.db = new PouchDB('sf-private', {
            auto_compaction: true,
        });
        this._syncSubject = new Subject<boolean>();
    }

    init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = details.userDBs.sf;
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

    get syncSubject() {
        return this._syncSubject;
    }

    public async removeDoc(doc: any) {
        const docFromDb = await this.db.get(doc._id);
        return this.db.remove(docFromDb._id, docFromDb._rev);
    }

    public async updateDoc(doc: any) {
        const docFromDb = await this.db.get(doc._id);
        doc._rev = docFromDb._rev;
        return this.db.put(doc);
    }
}
