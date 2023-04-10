import { Injectable } from '@angular/core';

import { getAuth, signInAnonymously } from 'firebase/auth';

import * as hash from 'hash.js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();

  private static hashString(str): string {
    return hash.sha256().update(str).digest('hex').substr(0, 16);
  }

  public async doSoftLogin() {
    try {
      let result = await signInAnonymously(this.auth);
      console.info(result);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  public async getUserId(): Promise<string | undefined> {
    return this.auth.currentUser?.uid;
  }
}
