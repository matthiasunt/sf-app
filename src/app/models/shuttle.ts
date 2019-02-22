import {Address} from './address';

export interface Shuttle {
    _id: string;
    type: string;
    name: string;
    phone: string;
    phoneSecondary?: string;
    score: number;
    info?: string;
    email?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    numberOfVehicles?: number;
    customColor?: string;

    address?: Address;
    location?: Coordinates;

    lastName?: string;
    firstName?: string;

    districtIds: string[];
    verified?: boolean;


}
