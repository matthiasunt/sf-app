import { inject, Injectable } from '@angular/core';
import { ElementType, ListElement } from '@models/list-element';
import { AuthService } from '@services/auth.service';
import { getApp } from 'firebase/app';
import { deleteDoc, doc, getFirestore, setDoc } from 'firebase/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private db = getFirestore(getApp());
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
    const userId: string | undefined = await this.authService.userId
      .pipe(take(1))
      .toPromise();
    if (userId) {
      const id = `${userId}--${type}--${shuttleId}`;
      const query = doc(this.db, `users/${userId}/${type}/${id}`);
      return await deleteDoc(query);
    }
  }
}
