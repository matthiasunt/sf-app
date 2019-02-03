import {Injectable, NgZone} from '@angular/core';
import {SfDbService} from '../sf-db/sf-db.service';
import {from, Observable} from 'rxjs';
import {Shuttle} from '../../models/shuttle';

@Injectable({
    providedIn: 'root'
})
export class ShuttlesService {

    constructor(private sfDbService: SfDbService,
                public zone: NgZone) {

    }

    public getAllShuttles(): Observable<any> {
        return from(this.sfDbService.db.query('shuttles/all', {include_docs: true}));
    }

    public getShuttlesByDistrict(districtId: string): Observable<any> {
        return from(this.sfDbService.db.query('shuttles/by_district', {
            include_docs: true, key: districtId
        }));
    }

    public getShuttle(shuttleId: string): Observable<Shuttle> {
        return from(this.sfDbService.db.get(shuttleId));
    }


    public getFormattedPhoneNumber(phone: string): string {
        let ret = '';
        if (phone && phone.length > -1) {
            if (phone.charAt(3) === '0') {
                ret += phone.substring(3, 7) + ' ' + phone.substring(7, 13);
            } else {
                ret += phone.substring(3, 6) + ' ' + phone.substring(6);
            }
        }
        return ret;
    }
}
