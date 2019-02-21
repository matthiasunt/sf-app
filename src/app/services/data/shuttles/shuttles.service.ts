import {Injectable, NgZone} from '@angular/core';
import {SfDbService} from '../sf-db/sf-db.service';
import {BehaviorSubject, from} from 'rxjs';
import {Shuttle} from '../../../models/shuttle';
import {List, Map} from 'immutable';
import {DistrictsService} from '../districts/districts.service';
import {ListElement} from '../../../models/list-element';
import {GeoService} from '../../geo/geo.service';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {
    private _allShuttles: BehaviorSubject<Map<string, Shuttle>> = new BehaviorSubject(Map({}));
    private _shuttlesByDistrict: Map<string, any> = Map({});

    constructor(private sfDbService: SfDbService,
                private geoService: GeoService,
                private districtsService: DistrictsService,
                public zone: NgZone) {
        this.loadInitialData();
    }


    get allShuttles() {
        return this._allShuttles;
    }

    public getShuttlesByDistrict(districtId: string) {
        return this._shuttlesByDistrict.get(districtId);
    }

    public async getShuttlesFromLocation(coordinates: Coordinates, radius: number) {
        let ret: Map<string, any> = Map();
        if (coordinates) {
            this._allShuttles.getValue().map((shuttle: Shuttle) => {
                if (shuttle && shuttle.coordinates) {
                    const distance = this.geoService.getDistance(coordinates, shuttle.coordinates);
                    if (distance && distance < radius) {
                        ret = ret.set(shuttle._id, {
                            shuttle: shuttle,
                            distance: distance
                        });
                    }
                }
            });
        }
        return this.buildRankingFromLocation(ret);
    }

    public mergeShuttles(shuttles: List<Shuttle>, favorites: List<ListElement>, blacklist: List<ListElement>): List<Shuttle> {
        let ret: List<Shuttle> = shuttles;
        favorites.map((favorite) => {
            // const index = ret.findIndex((shuttle) => shuttle._id === favorite.shuttleId);
            // ret = ret.delete(index);
            ret = ret.filter((shuttle) => {
                return favorite.shuttleId !== shuttle._id;
            });
        });
        ret = this.getShuttlesFromList(favorites).merge(ret);
        // blacklist.map((blacklisted) => {
        //     // const index = ret.findIndex((shuttle) => shuttle._id === blacklisted.shuttleId);
        //     // ret = ret.delete(index);
        //     ret = ret.filter((shuttle) => {
        //         return blacklisted.shuttleId !== shuttle._id;
        //     });
        // });
        console.log(ret);
        return ret;
    }

    private buildRankingFromLocation(map: Map<string, any>) {
        return map;
        // const a1: string[] = [];
        // const a2: string[] = [];
        // const a3: string[] = [];
        // arr.forEach((e) => {
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


    public getShuttlesFromList(list: List<ListElement>) {
        let shuttles: List<Shuttle> = List();
        list.map((element) => {
            shuttles = shuttles.push(this._allShuttles.getValue().get(element.shuttleId));
        });
        return shuttles;
    }

    private loadInitialData() {
        console.log('Load init data');
        // Fetch Shuttles by Districts
        this.districtsService.districts.subscribe((districts) => {
            districts.map((district) => {
                this.sfDbService.db.query('shuttles/by_district', {
                    include_docs: true, key: district._id
                }).then((res) => {
                    const shuttles: Shuttle[] = res.rows.map(row => {
                        return row.doc;
                    });
                    this._shuttlesByDistrict = this._shuttlesByDistrict.set(district._id, shuttles);
                });
            });
        });

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
    }

    public getShuttle(shuttleId: string): Shuttle {
        return this._allShuttles.value.get(shuttleId);
    }
}
