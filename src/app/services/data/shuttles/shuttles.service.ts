import {Injectable, NgZone} from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {List} from 'immutable';

import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {GeoService} from '@services/geo/geo.service';
import {MyCoordinates} from '@models/my-coordinates';
import {ListElement} from '@models/list-element';
import {Shuttle} from '@models/shuttle';
import {DocType} from '@models/doctype';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {
    private _allShuttles: BehaviorSubject<List<Shuttle>> = new BehaviorSubject(List([]));

    private static sortByRankingScore(shuttles: List<Shuttle>): List<Shuttle> {
        return shuttles.sort((a, b) => b.rankingScore - a.rankingScore);
    }

    constructor(private sfDbService: SfDbService,
                private geoService: GeoService,
                public zone: NgZone) {
        this.loadInitialData();
        this.sfDbService.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
            if (change.doc.type === DocType.Shuttle) {
                // console.log(`Change ${change.doc.name}`);
                const newShuttle: Shuttle = change.doc;
                let shuttles = this._allShuttles.value;
                shuttles = shuttles.set(shuttles.findIndex(s => s._id === newShuttle._id), newShuttle);
                this._allShuttles.next(shuttles);
            }
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

    /**
     * Get Shuttles for the passed District id and sort them by score.
     * @param districtId
     */
    public getShuttlesByDistrict(districtId: string): Observable<List<Shuttle>> {
        return this._allShuttles.pipe(
            map(shuttles => shuttles.filter((shuttle: Shuttle) =>
                shuttle.districtIds.indexOf(districtId) > -1)),
            map(shuttles => ShuttlesService.sortByRankingScore(shuttles)));

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
        return ShuttlesService.sortByRankingScore(ret);
    }

    public mergeShuttles(shuttles: List<Shuttle>, favorites: List<ListElement>, blacklist: List<ListElement>): List<Shuttle> {
        let ret: List<Shuttle> = shuttles;
        let favoriteShuttlesInList: List<Shuttle> = List([]);
        favorites.map((favorite) => {
            ret = ret.filter((shuttle) => {
                const found = favorite.shuttleId === shuttle._id;
                if (found) {
                    favoriteShuttlesInList = favoriteShuttlesInList.push(shuttle);
                }
                return !found;
            });
        });
        ret = favoriteShuttlesInList.merge(ret);
        blacklist.map((blacklisted) => {
            ret = ret.filter((shuttle) => {
                return blacklisted.shuttleId !== shuttle._id;
            });
        });
        return ret;
    }

    private loadInitialData() {
        this.sfDbService.syncSubject.subscribe(() => {
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
}
