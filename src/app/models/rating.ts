export interface Rating {
    _id: string;
    type: string;
    userId: string;
    date: string;
    review: ReviewElement[];
}

export interface ReviewElement {
    name: string;
    value: string;
}
