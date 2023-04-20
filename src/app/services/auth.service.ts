import { Injectable } from '@angular/core';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { setPersistence, indexedDBLocalPersistence } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(getApp());

  constructor() {
    setPersistence(this.auth, indexedDBLocalPersistence);
    signInAnonymously(this.auth).then((res) => {
      console.info(res.user.uid);
    });
  }

  public getUserId(): string | undefined {
    return this.auth.currentUser?.uid;
  }
}
