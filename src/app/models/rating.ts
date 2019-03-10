export interface Rating {
    _id: string;
    type: string;
    userId: string;
    shuttleId: string;
    date: string;

    service: string;
    reliabilityAndPunctuality: string;
    drivingStyleAndSecurity: string;
    price: string;

    review: string;
}
