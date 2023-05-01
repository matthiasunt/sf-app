import { Injectable } from '@angular/core';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getApp } from 'firebase/app';
import {
  setPersistence,
  indexedDBLocalPersistence,
  onAuthStateChanged,
} from '@firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(getApp());

  private _userId: BehaviorSubject<string | undefined> = new BehaviorSubject(
    undefined
  );

  get userId() {
    return this._userId;
  }

  constructor() {
    setPersistence(this.auth, indexedDBLocalPersistence);
    signInAnonymously(this.auth);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this._userId.next(user.uid);
      } else {
        this._userId.next(undefined);
      }
    });
  }
}
