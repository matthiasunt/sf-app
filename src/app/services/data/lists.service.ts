import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { ElementType, ListElement } from '@models/list-element';
import { AuthService } from '@services/auth.service';
import { initializeApp } from 'firebase/app';
import { deleteDoc, doc, getFirestore, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private db = getFirestore(initializeApp(environment.firebase));
  private authService = inject(AuthService);

  public async addListElement(listElement: ListElement) {
    try {
      await setDoc(
        doc(
          this.db,
          `users/${listElement.userId}/${listElement.type}/${listElement.id}`
        ),
        listElement
      );
    } catch (err) {
      console.error(err);
    }
  }

  public async removeListElementByShuttleId(
    shuttleId: string,
    type: ElementType
  ) {
    const userId = await this.authService.getUserId();
    const id = `${userId}--${type}--${shuttleId}`;
    const query = doc(this.db, `users/${userId}/${type}/${id}`);
    const res = await deleteDoc(query);
    return res;
  }
}
