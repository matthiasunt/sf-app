import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { District } from '@models/district';
import { map } from 'rxjs/operators';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DistrictsService {
  private firestore: Firestore = inject(Firestore);
  districts$: Observable<District[]>;

  constructor() {
    this.districts$ = collectionData(
      collection(this.firestore, 'districts')
    ) as Observable<District[]>;
  }

  public getDistrict = (districtId: string): Observable<District> =>
    this.districts$.pipe(
      map((districts) => districts.find((d) => d.id === districtId))
    );
}
