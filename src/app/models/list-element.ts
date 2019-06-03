import {CouchDoc} from '@models/couch-doc';

export interface ListElement extends CouchDoc {
    type: ElementType;
    userId: string;
    shuttleId: string;
    date: string;
}

export enum ElementType {
    Favorite = 'favorite',
    Blacklisted = 'blacklisted'
}
