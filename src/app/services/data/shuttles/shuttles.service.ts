import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from} from 'rxjs';
import {List, Map} from 'immutable';

import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {DistrictsService} from '@services/data/districts/districts.service';
import {GeoService} from '@services/geo/geo.service';
import {Coordinates} from '@models/coordinates';
import {ListElement} from '@models/list-element';
import {Shuttle} from '@models/shuttle';
import {DocType} from '@models/doctype';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {
    private _allShuttles: BehaviorSubject<Map<string, Shuttle>> = new BehaviorSubject(Map({}));
    private shuttlesByDistrict: Map<string, any> = Map({});

    constructor(private sfDbService: SfDbService,
                private geoService: GeoService,
                private districtsService: DistrictsService,
                public zone: NgZone) {
        this.loadInitialData();
        this.sfDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
            if (change.doc.type === DocType.Shuttle) {
                console.log('Shuttles changed');
                this.emitShuttles();
            }
        });
    }


    get allShuttles() {
        return this._allShuttles;
    }

    public filterShuttlesByPosition(shuttles: List<Shuttle>, coordinates: Coordinates, radius: number): List<Shuttle> {
        let ret: List<Shuttle> = List([]);
        if (coordinates) {
            shuttles.map((shuttle: Shuttle) => {
                if (shuttle && shuttle.coordinates) {
                    const distance = this.geoService.getDistance(coordinates, shuttle.coordinates);
                    if (distance && distance < radius) {
                        ret = ret.push(shuttle);
                    }
                }
            });
        }
        return ret;
    }

    public mergeShuttles(shuttles: List<Shuttle>, favorites: List<ListElement>, blacklist: List<ListElement>): List<Shuttle> {
        let ret: List<Shuttle> = shuttles;
        let favoriteShuttlesInList: List<ListElement> = List([]);
        favorites.map((favorite) => {
            ret = ret.filter((shuttle) => {
                const found = favorite.shuttleId === shuttle._id;
                if (found) {
                    favoriteShuttlesInList = favoriteShuttlesInList.push(favorite);
                }
                return !found;
            });
        });
        ret = this.getShuttlesFromList(favoriteShuttlesInList).merge(ret);
        blacklist.map((blacklisted) => {
            ret = ret.filter((shuttle) => {
                return blacklisted.shuttleId !== shuttle._id;
            });
        });
        return ret;
    }

    public rankShuttlesByScore(list: List<Shuttle>): List<Shuttle> {
        let ret: List<Shuttle> = List([]);
        if (list) {
            ret = list.sort(() => Math.random() - 0.5);
            ret = ret.sort((a, b) => {
                return b.rankingScore - a.rankingScore;
            });
        }
        return ret;
    }

    private buildRankingFromLocation(list: List<Shuttle>) {
        // const a1: string[] = [];
        // const a2: string[] = [];
        // const a3: string[] = [];
        // list.forEach((e) => {
        //     if (e.distance) {
        //         if (e.distance < 12000) {
        //             a1.push(e);
        //         } else if (e.distance < 25000) {
        //             a2.push(e);
        //         } else {
        //             a3.push(e);
        //         }
        //     }
        // });
        // a1.sort(() => Math.random() - 0.5);
        // a2.sort(() => Math.random() - 0.5);
        // a3.sort(() => Math.random() - 0.5);
        // return a1.concat(a2.concat(a3));
    }


    public getShuttlesFromList(list: List<ListElement>): List<Shuttle> {
        let shuttles: List<Shuttle> = List([]);
        if (list) {
            list.map((element) => {
                if (element && element.shuttleId) {
                    shuttles = shuttles.push(this._allShuttles.getValue().get(element.shuttleId));
                }
            });
        }
        return shuttles;
    }

    public async getShuttle(shuttleId: string): Promise<Shuttle> {
        return this._allShuttles.value.get(shuttleId);
        // if (shuttle) {
        //     return shuttle;
        // } else {
        //     this.sfDbService.getDoc(shuttleId).subscribe((res) => {
        //         return res;
        //     });
        // }
    }

    private emitShuttles() {
        this.zone.run(() => {
            from(this.sfDbService.db.query('shuttles/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        let shuttles: Map<string, Shuttle> = Map();
                        res.rows.map(row => {
                            shuttles = shuttles.set(row.doc._id, row.doc);
                        });
                        this._allShuttles.next(shuttles);
                    },
                    err => console.log('Error retrieving Shuttles')
                );
        });
    }

    private loadInitialData() {
        this.sfDbService.syncSubject.subscribe(() => {
            from(this.sfDbService.db.query('shuttles/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        let shuttles: Map<string, Shuttle> = Map();
                        res.rows.map(row => {
                            shuttles = shuttles.set(row.doc._id, row.doc);
                        });
                        this._allShuttles.next(shuttles);
                    },
                    err => console.log('Error retrieving Shuttles')
                );
        });
    }
}
