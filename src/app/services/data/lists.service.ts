import { inject, Injectable } from '@angular/core';
import { ElementType, ListElement } from '@models/list-element';
import { AuthService } from '@services/auth.service';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);

  public async addListElement(listElement: ListElement) {
    return addDoc(
      collection(
        this.firestore,
        `users/${listElement.userId}/${listElement.type}`
      ),
      listElement
    );
  }

  public async removeListElement(shuttleId: string, type: ElementType) {
    const userId: string | undefined = await this.authService.userId$
      .pipe(take(1))
      .toPromise();
    if (userId) {
      const id = `${userId}--${type}--${shuttleId}`;
      const listEntryRef = doc(this.firestore, `users/${userId}/${type}/${id}`);
      try {
        await deleteDoc(listEntryRef);
      } catch (err) {
        console.error(err);
      }
    }
  }
}
