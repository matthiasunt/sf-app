import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInAnonymously,
  browserLocalPersistence,
  authState,
} from '@angular/fire/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private authState$ = authState(this.auth);
  public userId$ = this.authState$.pipe(map((state) => state?.uid));

  constructor() {
    this.auth.setPersistence(browserLocalPersistence);
    signInAnonymously(this.auth);
  }
}
