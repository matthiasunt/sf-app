import {Address} from './address';

export interface Shuttle {
    _id: string;
    name: string;
    phone: string;
    phoneSecondary?: string;
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


}
