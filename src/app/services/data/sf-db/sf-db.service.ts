import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {ENV} from '@env';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;

    private _syncSubject: Subject<boolean>;

    constructor() {

        this.db = new PouchDB('dev-shuttle-finder-public');
        this._syncSubject = new Subject<boolean>();

        this.remote = ENV.DB_PROTOCOL + '://' + ENV.DB_USER + ':'
            + ENV.DB_PASS + '@' + ENV.DB_HOST + '/dev-shuttle-finder-public';

        this.db.replicate.from(this.remote, {
            retry: true, live: true
        }).on('change', (info) => {
            console.log('change');
            // this._syncSubject.next(true);
        }).on('paused', (err) => {
            console.log('pause');
            this._syncSubject.next(true);
        }).on('error', (err) => {
            console.error(err);
        });
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
