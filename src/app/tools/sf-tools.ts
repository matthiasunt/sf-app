import { Shuttle } from '../models/shuttle';

export function getIndexOfShuttle(arr: any[], shuttle: Shuttle): number {
  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]._id === shuttle._id) {
        return i;
      }
    }
  } else {
    console.log('arr not defined');
  }
  return -1;
}

export function getIndexOfShuttleInList(list: any[], shuttle: Shuttle): number {
  // console.log(list);

  if (list && shuttle) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].shuttle && list[i].shuttle._id === shuttle._id) {
        return i;
      }
    }
  } else {
    console.log('list not defined');
  }
  return -1;
}
