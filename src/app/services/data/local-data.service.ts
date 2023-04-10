import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

import { HistoryElement } from '@models/history-element';
import { BehaviorSubject } from 'rxjs';

import { Shuttle } from '@models/shuttle';

@Injectable({
  providedIn: 'root',
})
/**
 *
 */
export class LocalDataService {
  private _lang: BehaviorSubject<string> = new BehaviorSubject(
    this.translate.getBrowserLang()
  );
  private _history: BehaviorSubject<HistoryElement[]> = new BehaviorSubject([]);
  private _favoriteShuttles: BehaviorSubject<Shuttle[]> = new BehaviorSubject(
    []
  );
  private _blacklistedShuttles: BehaviorSubject<Shuttle[]> =
    new BehaviorSubject([]);

  private numberOfCalls: number;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private platform: Platform,
    private storage: Storage
  ) {
    this.fetchData();
  }

  get lang() {
    return this._lang;
  }

  get history() {
    return this._history;
  }

  get favoriteShuttles() {
    return this._favoriteShuttles;
  }

  get blacklistedShuttles() {
    return this._favoriteShuttles;
  }

  private async fetchData() {
    await this.storage.ready();

    // Language Setting
    let val = await this.getItem('lang');
    if (val) {
      this._lang.next(val);
    }

    // Favorites and Blacklisted Shuttles
    val = await this.getItem('favoriteShuttles');
    if (val && val.length > 0) {
      this._favoriteShuttles.next(val);
    }
    val = await this.getItem('blacklistedShuttles');
    if (val && val.length > 0) {
      this._blacklistedShuttles.next(val);
    }

    // Shuttle Call History
    val = await this.getItem('history');
    if (val) {
      this._history.next(val);
    }
  }

  public async addToHistory(historyElement: HistoryElement) {
    const updated = this._history.getValue();
    updated.splice(0, 0, historyElement);
    this._history.next(updated);
    return await this.saveItem('history', this.history.getValue());
  }

  public async clearHistory() {
    this._history.next([]);
    return await this.saveItem('history', []);
  }

  public addFavoriteShuttle(shuttle: Shuttle) {
    const updated = this.favoriteShuttles.getValue();
    updated.push(shuttle);
    return this.setFavoriteShuttles(updated);
  }

  public removeFavoriteShuttle(shuttle: Shuttle) {
    const updated = this._favoriteShuttles.getValue();
    updated.splice(
      updated.findIndex((s) => s.id === shuttle.id),
      1
    );
    return this.setFavoriteShuttles(updated);
  }

  public addBlacklistedShuttle(shuttle: Shuttle) {
    const updated = this.blacklistedShuttles.getValue();
    updated.push(shuttle);
    return this.setBlacklistedShuttles(updated);
  }

  public removeBlacklistedShuttle(shuttle: Shuttle) {
    const updated = this._blacklistedShuttles.getValue();
    updated.splice(
      updated.findIndex((s) => s.id === shuttle.id),
      1
    );
    return this.setBlacklistedShuttles(updated);
  }

  private setFavoriteShuttles(shuttles: Shuttle[]) {
    this._favoriteShuttles.next(shuttles);
    return this.saveItem('favoriteShuttles', shuttles);
  }

  private setBlacklistedShuttles(shuttles: Shuttle[]) {
    this._blacklistedShuttles.next(shuttles);
    return this.saveItem('blacklistedShuttles', shuttles);
  }

  public async setLang(lang: string) {
    this._lang.next(lang);
    await this.saveItem('lang', lang);
  }

  private async getItem(key: string): Promise<any> {
    await this.storage.ready();
    return await this.storage.get(key);
  }

  private async saveItem(key: string, item: any): Promise<any> {
    await this.storage.ready();
    return await this.storage.set(key, item);
  }
}
