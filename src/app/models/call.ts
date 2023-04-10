export interface Call {
  id: String;
  startDate: Date;
  endDate: Date;
  userId: string;
  shuttleId: string;
  origin: CallOrigin;
}

export interface CallOrigin {
  name: CallOriginName;
  value: any;
}

export enum CallOriginName {
  History = 'history',
  District = 'district',
  Gps = 'gps',
  Favorites = 'favorite',
  Other = 'other',
}
