import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import PouchDB from 'pouchdb';
import {LocalDataService} from '../local-data/local-data.service';
import {GeoService} from '../geo/geo.service';
import {District} from '../../models/district';
import {Shuttle} from '../../models/shuttle';
import {ENV} from '@env';
import {getIndexOfShuttle, getIndexOfShuttleInList} from '../../tools/sf-tools';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SfDbService {

    public db: any;
    private remote: string;
    private details: any;

    private districts: District[];
    private shuttlesByDistricts: any[];
    private allShuttles: Shuttle[];
    private history: any[];
    private favorites: any[];
    private blacklist: any[];
    private settings: any;

    private syncSubject: Subject<boolean>;

    constructor(
        private http: HttpClient,
        private localData: LocalDataService,
        private geoService: GeoService,
    ) {

        this.db = new PouchDB('sf-public');
        this.syncSubject = new Subject();

        this.remote = ENV.DB_PROTOCOL + '://' + ENV.DB_USER + ':'
            + ENV.DB_PASS + '@' + ENV.DB_HOST + '/sf-public';

        this.db.replicate.from(this.remote, {
            retry: true
        }).on('complete', (info) => {
            console.log(info);
            this.syncSubject.next(true);
            // this.fetchEverything();
        }).on('error', (err) => {
            console.error(err.code);
        });
    }

    public async fetchEverything() {
        const districts = await this.getDistricts();
        // this.getAllShuttles();
        // if (districts) {
        //     districts.forEach((e) => {
        //         this.getShuttlesByDistrict(e);
        //     });
        // }
    }

    public async getDistricts(): Promise<District[]> {
        if (this.districts && this.districts.length > 7) {
            return Promise.resolve(this.districts);
        }
        this.syncSubject.subscribe({
            async next(isDone) {
                console.log(isDone);
                if (isDone) {
                    try {
                        console.log(this.db);
                        const res = await this.db.query('districts/all', {include_docs: true});
                        this.districts = [];
                        res.rows.map((row) => this.districts.push(row.doc));
                        return this.districts;
                    } catch (err) {
                        console.error(err);
                        // return this.backupData.getDistricts();
                    }
                }
            }
        });
    }

    public async getDistrict(id: string): Promise<District> {
        this.districts = await this.getDistricts();
        return this.districts.find((e) => e._id === id);
    }

    public async getShuttle(id: string): Promise<Shuttle> {
        return await this.db.get(id);
        // this.allShuttles = await this.getAllShuttles();
        // if (this.allShuttles[0]) {
        //     return this.allShuttles.find((e) => e._id === id);
        // } else {
        //     console.error('Shuttles undefined!');
        // }
    }

    public async getShuttlesByDistrict(district: District): Promise<Shuttle[]> {
        const e = this.getShuttlesFromCache(district._id);
        if (e) {
            return Promise.resolve(e.shuttles);
        } else {
            try {
                const res = await this.db.query('shuttles/by_district', {
                    include_docs: true, key: district._id
                });
                const ret = {districtId: district._id, shuttles: []};
                res.rows.map((row) => {
                    ret.shuttles.push(row.doc);
                });
                if (!this.shuttlesByDistricts) {
                    this.shuttlesByDistricts = [];
                }
                this.shuttlesByDistricts.push(ret);
                return ret.shuttles;
            } catch (err) {
                console.error(err);
                // return this.backupData.getShuttlesByDistrict(district._id);
            }

        }
    }

    // define type
    public async getShuttlesFromLocation(position: any, radius: number): Promise<any[]> {
        const ret: any[] = [];
        if (position) {
            const allShuttles = await this.getAllShuttles();
            for (const s of allShuttles) {
                if (s && s.location) {
                    const distance = this.geoService.getDistance(position, s.location);
                    if (distance && distance < radius) {
                        const shuttle: any = s;
                        shuttle.distance = distance;
                        ret.push(shuttle);
                    }
                }
            }
        }
        return this.buildRankingFromLocation(ret);
    }

    private buildRankingFromLocation(arr: any[]): any {
        const a1: string[] = [];
        const a2: string[] = [];
        const a3: string[] = [];
        arr.forEach((e) => {
            if (e.distance) {
                if (e.distance < 12000) {
                    a1.push(e);
                } else if (e.distance < 25000) {
                    a2.push(e);
                } else {
                    a3.push(e);
                }
            }
        });
        a1.sort(() => Math.random() - 0.5);
        a2.sort(() => Math.random() - 0.5);
        a3.sort(() => Math.random() - 0.5);
        return a1.concat(a2.concat(a3));
    }


    private buildRankingFromLocationInRanges(arr: any[], radius: number): any {
        const range1: string[] = [];
        const range2: string[] = [];
        const range3: string[] = [];
        arr.forEach((e) => {
            if (e.distance) {
                if (e.distance < 12000) {
                    range1.push(e);
                } else if (e.distance < 25000) {
                    range2.push(e);
                } else {
                    range3.push(e);
                }
            }
        });
        return {
            ranges: [
                {
                    distance: 12000,
                    shuttles: range1.sort(() => Math.random() - 0.5)
                },
                {
                    distance: 25000,
                    shuttles: range2.sort(() => Math.random() - 0.5)
                },
                {
                    distance: radius,
                    shuttles: range3.sort(() => Math.random() - 0.5)
                }
            ]
        };

    }

    // Should be a defined type (id, shuttle[])
    private getShuttlesFromCache(id: string): any {
        if (this.shuttlesByDistricts) {
            return this.shuttlesByDistricts.find((e) => e.districtId === id);
        }
    }


    public async getAllShuttles(): Promise<Shuttle[]> {
        if (this.allShuttles && this.allShuttles[0] !== undefined) {
            return this.allShuttles;
        } else {
            try {
                const res = await this.db.query('shuttles/all', {include_docs: true});
                this.allShuttles = [];
                return res.rows.map((row) => {
                    this.allShuttles.push(row.doc);
                });
            } catch (err) {
                console.log(err);
                // return this.backupData.getAllShuttles();
            }
        }
    }

    public async getMergedShuttles(shuttles: Shuttle[]): Promise<Shuttle[]> {
        const s = shuttles.slice(0);
        // Save and remove favorites
        const favorites = await this.localData.getFavorites();
        const favoritesInShuttles: Shuttle[] = [];
        for (const fShuttle of favorites) {
            const index = getIndexOfShuttle(s, fShuttle);
            if (index !== -1) {
                favoritesInShuttles.push(s[index]);
                s.splice(index, 1);
            }
        }
        // Remove blacklisted
        const blacklist = await this.localData.getBlacklist();
        for (const bShuttle of blacklist) {
            const index = getIndexOfShuttle(s, bShuttle);
            if (index !== -1) {
                s.splice(index, 1);
            }
        }
        // Sort randomly
        s.sort(() => Math.random() - 0.5);
        return favoritesInShuttles.concat(s);
    }
}
