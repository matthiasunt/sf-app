export interface ListElement {
    userId: string;
    shuttleId: string;
    date: string;
    elementType: ElementType;
}

export enum ElementType {
    Favorite,
    Blacklisted,
}
