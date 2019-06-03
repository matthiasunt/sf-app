import {CouchDoc} from '@models/couch-doc';

export interface Rating extends CouchDoc{
    type: string;
    userId: string;
    shuttleId: string;
    date: string;

    totalAvg: number;
    service: number;
    reliabilityAndPunctuality: number;
    drivingStyleAndSecurity: number;
    price: number;

    review: string;
}
