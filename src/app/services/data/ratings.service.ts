import { inject, Injectable } from '@angular/core';
import { Rating } from '@models/rating';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class RatingsService {
  private firestore: Firestore = inject(Firestore);

  // Subscribe to rating changes
  public getRatings(shuttleId: string): Observable<Rating[]> {
    const shuttleRatingsRef = collection(
      this.firestore,
      `shuttles/${shuttleId}/ratings`
    );
    return collectionData(shuttleRatingsRef) as Observable<Rating[]>;
  }

  public async setRating(rating: Rating) {
    const shuttleRatingsRef = collection(
      this.firestore,
      `shuttles/${rating.shuttleId}/ratings`
    );
    try {
      await setDoc(doc(shuttleRatingsRef, rating.id), rating);
    } catch (err) {
      console.error(err);
    }
  }

  public async deleteRating(rating: Rating) {
    const shuttleRatingsRef = collection(
      this.firestore,
      `shuttles/${rating.shuttleId}/ratings`
    );
    try {
      await deleteDoc(doc(shuttleRatingsRef, rating.id));
    } catch (err) {
      console.error(err);
    }
  }
}
