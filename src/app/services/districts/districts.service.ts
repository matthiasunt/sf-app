import {Injectable, NgZone} from '@angular/core';
import {SfDbService} from '../sf-db/sf-db.service';
import {from, Observable} from 'rxjs';
import {District} from '../../models/district';

@Injectable({
    providedIn: 'root'
})
export class DistrictsService {


    constructor(private sfDbService: SfDbService) {

    }

    public getDistricts(): Observable<any> {
        return from(this.sfDbService.db.query('districts/all', {include_docs: true}));
    }

    public getDistrict(districtId: string): Observable<District> {
        return from(this.sfDbService.db.get(districtId));
    }
}
