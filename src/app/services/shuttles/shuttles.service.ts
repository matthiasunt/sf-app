import {Injectable, NgZone} from '@angular/core';
import {SfDbService} from '../sf-db/sf-db.service';
import {BehaviorSubject, from} from 'rxjs';
import {Shuttle} from '../../models/shuttle';
import {List, Map} from 'immutable';
import {DistrictsService} from '../districts/districts.service';
import {ListElement} from '../../models/list-element';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {
    private _allShuttles: BehaviorSubject<Map<string, Shuttle>> = new BehaviorSubject(Map({}));
    private _shuttlesByDistrict: Map<string, any> = Map({});

    constructor(private sfDbService: SfDbService,
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
