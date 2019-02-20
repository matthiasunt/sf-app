import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import PouchDB from 'pouchdb';
import {GeoService} from '../geo/geo.service';
import {Shuttle} from '../../models/shuttle';
import {District} from '../../models/district';

@Injectable({
    providedIn: 'root'
})
export class UserDbService {

    private userId: string;
    public db: any;
    private remote: string;
    private details: any;
    private history: any[];
    private favorites: any[];
    private blacklist: any[];
    private settings: any;

    constructor(public http: HttpClient,
                private geoService: GeoService) {

        this.db = new PouchDB('sf-private');
    }

    init(details) {
        this.userId = details.user_id;
        this.details = details;
        this.remote = details.userDBs.sf;
        console.log(details);
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
                         district: District,
    ) {


        let position;
        // if (await this.diagnostic.isLocationAuthorized() && await this.diagnostic.isLocationEnabled()) {
        //     position = await this.geoService.getPosition();
        // }

        if (this.userId && shuttle && start && end) {
            this.db.put({
                _id: 'call-' + this.userId + '-' + start.getTime(),
                type: 'call',
                shuttle: shuttle._id,
                public: false,
                user_id: this.userId,
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

    public async removeDoc(doc: any) {
        const docFromDb = await this.db.get(doc._id);
        return this.db.remove(docFromDb._id, docFromDb._rev);
    }

    public getUserId() {
        if (this.details) {
            return this.details.user_id;
        } else {
            console.log('Details not defined');
        }
    }
}
