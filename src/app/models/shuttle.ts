import { Address } from './address';
import { MyCoordinates } from './my-coordinates';
import { AvgRating } from '@models/avg-rating';

export interface Shuttle {
  id: string;
  hidden: Boolean;
  name: string;
  phone: string;
  rankingScore: number;
  info?: string;
  email?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  numberOfVehicles?: number;
  customColor?: string;

  address?: Address;
  coordinates?: MyCoordinates;

  lastName?: string;
  firstName?: string;

  districtIds: string[];
  verified?: boolean;

  avgRating: AvgRating;
}
