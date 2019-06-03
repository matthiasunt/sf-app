import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {List, Map} from 'immutable';

import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {DistrictsService} from '@services/data/districts/districts.service';
import {GeoService} from '@services/geo/geo.service';
import {MyCoordinates} from '@models/my-coordinates';
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
        this.sfDbService.syncSubject.subscribe(() => {
            this.sfDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
                if (change.doc.type === DocType.Shuttle) {
                    console.log('Shuttles changed');
                    this.emitShuttles();
                }
            });
        });

    }


    get allShuttles() {
        return this._allShuttles;
    }

    public filterShuttlesByPosition(shuttles: List<Shuttle>, coordinates: MyCoordinates, radius: number): List<Shuttle> {
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

    public getShuttle(shuttleId: string): Observable<any> {
        return this.sfDbService.getDoc(shuttleId);
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
        this.emitShuttles();
    }
}
