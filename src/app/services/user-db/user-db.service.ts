import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Platform} from '@ionic/angular';
import PouchDB from 'pouchdb';
import {GeoService} from '../geo/geo.service';
import {Shuttle} from '../../models/shuttle';
import {District} from '../../models/district';

@Injectable({
    providedIn: 'root'
})
export class UserDbService {

    private db: any;
    private remote: string;
    private details: any;

    private history: any[];
    private favorites: any[];
    private blacklist: any[];
    private settings: any;

    constructor(public http: HttpClient,
                public platform: Platform,
                public storage: Storage,
                private geoService: GeoService) {

        this.db = new PouchDB('sf-private');
    }

    init(details) {
        this.details = details;
        this.remote = details.userDBs.sf;

        this.db.sync(this.remote, {live: true, retry: true})
            .on('denied', (err) => {
                console.log(err);
            }).on('error', (err) => {
            console.log(err);
        });
    }

    logout() {
        this.history = null;
        this.favorites = null;
        this.blacklist = null;
        this.settings = null;

        this.db.destroy().then(() => {
            console.log('database removed');
        });
    }

    public async putCall(shuttle: Shuttle,
                         start: Date,
                         end: Date,
                         district: District,) {

        const uid = this.getUserId();
        let position;
        // if (await this.diagnostic.isLocationAuthorized() && await this.diagnostic.isLocationEnabled()) {
        //     position = await this.geoService.getPosition();
        // }

        if (uid && shuttle && start && end) {
            this.db.put({
                _id: 'call-' + uid + '-' + start.getTime(),
                type: 'call',
                shuttle: shuttle,
                public: false,
                user_id: uid,
                start_time: start,
                end_time: end,
                location: position,
                district: district,
            }).then(res => console.log(res))
                .catch((err) => console.error(err));
        } else {
            console.log('Error putting call');
        }
    }

    public putFavorite(shuttle: Shuttle) {
        console.log('Putting favorite on remote');
        this.putListElement(shuttle, 'favorite');
    }


    public putBlacklisted(shuttle: Shuttle) {
        console.log('Putting blacklisted on remote');
        this.putListElement(shuttle, 'blacklisted');
    }


    private putListElement(shuttle: Shuttle, listType: string) {
        const uid = this.getUserId();
        if (uid) {
            const doc = {
                _id: listType + '-' + uid + '-' + shuttle._id,
                type: listType,
                user_id: uid,
                shuttle: shuttle,
                date: new Date(),
                public: false,
            };
            console.log(doc);
            this.db.put(doc)
                .then((res) => {
                    console.log(res);
                }).catch((err) => {
                if (err.status === 409) {
                    this.db.get(doc._id).then((res) => {
                        this.db.put(res).catch(err => console.error(err));
                    }).catch(err => console.error(err));
                } else {
                    console.error(err);
                }
            });
        } else {
            console.log('uid not defined');
        }
    }


    private getDocsFromView(query: string): Promise<any[]> {
        return new Promise((resolve) => {
            this.db.query(query, {
                include_docs: true,
            }).then((res) => {
                const ret = [];
                res.rows.map((row) => {
                    if (!row.doc.cleared) {
                        ret.push(row.doc);
                    }
                });
                resolve(ret);
            }).catch((err) => {
                console.error(err);
            });
        });
    }

    public async removeDoc(doc: any) {
        const docFromDb = await this.db.get(doc._id);
        return this.db.remove(docFromDb._id, docFromDb._rev);
    }

    public getUserId() {
        if (this.details) {
            return this.details.user_id;
        } else {
            console.log('details not defined');
        }
    }
}
