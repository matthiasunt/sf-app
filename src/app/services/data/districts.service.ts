import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { District } from '@models/district';
import { map } from 'rxjs/operators';
import { collection, getDocs, getFirestore, query } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class DistrictsService {
  private db = getFirestore(getApp());

  private _districts: BehaviorSubject<District[]> = new BehaviorSubject([]);

  constructor() {
    this.loadInitialData();
  }

  get districts() {
    return this._districts;
  }

  public getDistrict(districtId: string): Observable<District> {
    return this._districts.pipe(
      map((districts) => districts.find((d) => d.id === districtId))
    );
  }

  async loadInitialData() {
    let q = query(collection(this.db, 'districts'));
    try {
      const querySnapshot = await getDocs(q);
      const districts: District[] = [];
      querySnapshot.forEach((doc) => districts.push(doc.data() as District));
      this._districts.next(districts);
    } catch (error) {
      console.error(error);
    }
  }
}
