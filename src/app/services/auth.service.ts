import { Injectable } from '@angular/core';
import { initializeAuth, signInAnonymously } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { setPersistence, indexedDBLocalPersistence } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = initializeAuth(getApp());

  constructor() {
    setPersistence(this.auth, indexedDBLocalPersistence);
  }

  public async doSoftLogin() {
    try {
      let result = await signInAnonymously(this.auth);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  public async getUserId(): Promise<string | undefined> {
    return this.auth.currentUser?.uid;
  }
}
