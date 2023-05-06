import { Shuttle } from '@models/shuttle';

export const trackShuttleById: (index: number, item: Shuttle) => number = (
  index,
  item
) => Number(item.id.substring(1));
