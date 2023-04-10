export interface ListElement {
  id: string;
  type: ElementType;
  userId: string;
  shuttleId: string;
  date: string;
}

export enum ElementType {
  Favorites = 'favorites',
  Blacklisted = 'blacklisted',
}
