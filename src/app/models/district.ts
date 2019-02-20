export interface District {
    _id: string;
    name: {
        de: string;
        it: string;
        de_st: string;
    };
    region: {
        de: string;
        it: string;
    };
    country: {
        de: string;
        it: string;
    };

    coordinates: Coordinates;
}
