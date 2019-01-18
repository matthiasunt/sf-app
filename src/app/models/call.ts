import {Shuttle} from './shuttle';
import {District} from './district';

export interface Call {
    _id: string;
    shuttle: Shuttle;
    public: false;
    user_id: string;
    start_time: string;
    end_time: string;
    location: {
        latitude: string,
        longitude: string
    };
    district: District;
}
