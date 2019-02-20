export interface ListElement {
    _id: string;
    type: ElementType;
    userId: string;
    shuttleId: string;
    date: string;
}

export enum ElementType {
    Favorite = 'favorite',
    Blacklisted = 'blacklisted'
}
