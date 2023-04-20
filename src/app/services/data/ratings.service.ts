import { Injectable } from '@angular/core';
import { Rating } from '@models/rating';
import { BehaviorSubject, Observable } from 'rxjs';
import { getApp } from 'firebase/app';
import {
  getFirestore,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  private db = getFirestore(getApp());

  private _ratingsByShuttle: BehaviorSubject<{
    [shuttleId: string]: Rating[];
  }> = new BehaviorSubject({});

  get ratingsByShuttle(): Observable<{ [shuttleId: string]: Rating[] }> {
    return this._ratingsByShuttle;
  }

  public async setRating(rating: Rating) {
    const res = await setDoc(
      doc(this.db, 'shuttles', rating.shuttleId, 'ratings', rating.id),
      rating
    );
    const current = this._ratingsByShuttle.getValue();
    console.info(res);
  }

  public async deleteRating(rating: Rating) {
    const res = await deleteDoc(
      doc(this.db, 'shuttles', rating.shuttleId, 'ratings', rating.id)
    );
    return res;
  }

  public async getRatings(shuttleId: string): Promise<Rating[]> {
    const current = this._ratingsByShuttle.getValue();

    if (shuttleId in current) {
      return current[shuttleId];
    }
    let q = query(collection(this.db, 'shuttles', shuttleId, 'ratings'));
    const querySnapshot = await getDocs(q);
    const ratings: Rating[] = [];
    querySnapshot.forEach((doc) => ratings.push(doc.data() as Rating));
    current[shuttleId] = ratings;
    return ratings;
  }
}
