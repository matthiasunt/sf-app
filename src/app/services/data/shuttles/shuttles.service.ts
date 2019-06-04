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
import {filter, map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {
    private _allShuttles: BehaviorSubject<List<Shuttle>> = new BehaviorSubject(List([]));
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

    public getShuttle(shuttleId: string): Observable<Shuttle> {
        return this._allShuttles.pipe(
            map(shuttles => shuttles.find(s => s._id === shuttleId))
        );
    }

    public getShuttlesByDistrict(districtId: string): Observable<List<Shuttle>> {
        return this._allShuttles.pipe(
            map(shuttles => shuttles.filter((shuttle: Shuttle) =>
                shuttle.districtIds.indexOf(districtId) > -1)));

    }

    public getShuttlesByPosition(position: MyCoordinates) {
        
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

    // TODO: Refactor
    public getShuttlesFromList(list: List<ListElement>): List<Shuttle> {
        let shuttles: List<Shuttle> = List([]);
        if (list) {
            list.map((element) => {
                if (element && element.shuttleId) {
                    shuttles = shuttles.push(this._allShuttles.getValue().find(s => s._id === element.shuttleId));
                }
            });
        }
        return shuttles;
    }

    private emitShuttles() {
        this.zone.run(() => {
            from(this.sfDbService.db.query('shuttles/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        let shuttles: List<Shuttle> = List([]);
                        res.rows.map(row => {
                            shuttles = shuttles.push(row.doc);
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
