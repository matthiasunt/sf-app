import {Injectable, NgZone} from '@angular/core';
import {SfDbService} from '../sf-db/sf-db.service';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {List} from 'immutable';
import {District} from '@models/district';

@Injectable({
    providedIn: 'root'
})
export class DistrictsService {

    private _districts: BehaviorSubject<List<District>> = new BehaviorSubject(List([]));

    constructor(private sfDbService: SfDbService) {
        this.loadInitialData();
    }

    get districts() {
        return this._districts;
    }

    loadInitialData() {
        this.sfDbService.syncSubject.subscribe(() => {
            from(this.sfDbService.db.query('districts/all', {include_docs: true}))
                .subscribe(
                    (res: any) => {
                        const districts: District[] = res.rows.map(row => {
                            return row.doc;
                        });
                        this._districts.next(List(districts));
                    },
                    err => {
                        console.log(err);
                        console.log('Error retrieving Districts');
                    }
                );
        });
    }

    public getDistrict(districtId: string): Observable<District> {
        return from(this.sfDbService.db.get(districtId));
    }
}
