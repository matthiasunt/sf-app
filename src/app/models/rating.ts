export interface Rating {
  id: string;
  userId: string;
  shuttleId: string;
  date: string;

  totalAvg: number;
  service: number;
  reliabilityAndPunctuality: number;
  drivingStyleAndSecurity: number;
  price: number;

  review: string;
}

export interface RatingForm {
  service: number;
  reliabilityAndPunctuality: number;
  drivingStyleAndSecurity: number;
  price: number;

  review: string;
}
