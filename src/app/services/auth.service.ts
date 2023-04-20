import { Injectable } from '@angular/core';
import { getAuth, signInAnonymously } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();

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
