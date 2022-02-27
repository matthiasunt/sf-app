import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { ENV } from '@env';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SfDbService {
  public db: any;
  private remote: string;

  private _syncSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor() {
    this.db = new PouchDB(`${ENV.SF_PUBLIC_DB}_v2`);
    console.log('Public Pouch is here!');
    this._syncSubject.next(true);

    this.remote = `${ENV.DB_PROTOCOL}://${ENV.DB_USER}:${ENV.DB_PASS}@${ENV.DB_HOST}/${ENV.SF_PUBLIC_DB}`;
    this.db.replicate
      .from(this.remote, {
        retry: true,
        live: true,
      })
      .on('change', (info) => {
        // console.log('change');
      })
      .on('paused', (err) => {
        this._syncSubject.next(true);
      })
      .on('error', (err) => {
        console.log('error');
        console.error(err);
        this._syncSubject.next(true);
      });
  }

  get syncSubject() {
    return this._syncSubject;
  }
}
