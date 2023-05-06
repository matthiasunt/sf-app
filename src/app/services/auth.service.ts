import { inject, Injectable } from '@angular/core';
import { Auth, signInAnonymously, authState } from '@angular/fire/auth';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private authState$ = authState(this.auth);
  public userId$ = this.authState$.pipe(map((state) => state?.uid));

  constructor() {
    signInAnonymously(this.auth).then((res) => console.info(res.user.uid));
  }
}
