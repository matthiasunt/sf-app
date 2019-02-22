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
    public syncSubject: Subject<boolean>;

    constructor(public http: HttpClient) {
        this.db = new PouchDB('sf-private');
        this.syncSubject = new Subject<boolean>();
    }

    init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = details.userDBs.sf;
        this.db.sync(this.remote, {
            retry: true
        }).on('change', function (info) {
            this.syncSubject.next(true);
        }).on('paused', function (err) {
            this.syncSubject.next(true);
        }).on('complete', (info) => {
            this.syncSubject.next(true);
        }).on('error', (err) => {
            console.error(err);
        });
    }

    public async removeDoc(doc: any) {
        const docFromDb = await this.db.get(doc._id);
        return this.db.remove(docFromDb._id, docFromDb._rev);
    }
}
