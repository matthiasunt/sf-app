import { Injectable } from '@angular/core';
import { Rating } from '@models/rating';
import { Observable } from 'rxjs';
import { getApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  private db = getFirestore(getApp());

  // Subscribe to rating changes
  public getRatings(shuttleId: string): Observable<Rating[]> {
    return new Observable<Rating[]>((observer) => {
      const unsubscribe = onSnapshot(
        query(collection(this.db, 'shuttles', shuttleId, 'ratings')),
        (querySnapshot) => {
          const ratings: Rating[] = [];
          querySnapshot.forEach((doc) => ratings.push(doc.data() as Rating));
          observer.next(ratings);
        }
      );
      return unsubscribe;
    });
  }

  public async setRating(rating: Rating) {
    console.log(rating);
    try {
      const res = await setDoc(
        doc(this.db, 'shuttles', rating.shuttleId, 'ratings', rating.id),
        rating
      );
    } catch (err) {
      console.error(err);
    }
  }

  public async deleteRating(rating: Rating) {
    return await deleteDoc(
      doc(this.db, 'shuttles', rating.shuttleId, 'ratings', rating.id)
    );
  }
}
