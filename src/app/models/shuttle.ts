import {Address} from './address';
import {Coordinates} from './coordinates';
import {AvgRating} from '@models/avg-rating';

export interface Shuttle {
    _id: string;
    type: string;
    name: string;
    phone: string;
    rankingScore: number;
    info?: string;
    email?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    numberOfVehicles?: number;
    customColor?: string;

    address?: Address;
    coordinates?: Coordinates;

    lastName?: string;
    firstName?: string;

    districtIds: string[];
    verified?: boolean;

    avgRating: AvgRating;
}
