import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';

import {HistoryElement} from '@models/history-element';
import {BehaviorSubject} from 'rxjs';
import {List} from 'immutable';
import {Shuttle} from '@models/shuttle';

@Injectable({
    providedIn: 'root'
})
/**
 *
 */
export class LocalDataService {

    private softLoginCredentials: any;
    private _lang: BehaviorSubject<string> = new BehaviorSubject(this.translate.getBrowserLang());
    private _history: BehaviorSubject<List<HistoryElement>> = new BehaviorSubject(List([]));
    private _favoriteShuttles: BehaviorSubject<List<Shuttle>> = new BehaviorSubject(List([]));
    private _blacklistedShuttles: BehaviorSubject<List<Shuttle>> = new BehaviorSubject(List([]));

    private numberOfCalls: number;


    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private platform: Platform,
        private storage: Storage,
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

        // Favorite- and Blacklisted Shuttles
        val = await this.getItem('favoriteShuttles');
        if (val && val.length > 0) {
            this._favoriteShuttles.next(List(val));
        }
        val = await this.getItem('blacklistedShuttles');
        if (val && val.length > 0) {
            this._blacklistedShuttles.next(List(val));
        }

        // Shuttle Call History
        val = await this.getItem('history');
        if (val) {
            this._history.next(List(val));
        }
    }

    public async addToHistory(historyElement: HistoryElement) {
        this._history.next(this._history.value.insert(0, historyElement));
        return await this.saveItem('history', this.history.getValue().toArray());
    }

    public async clearHistory() {
        this._history.next(List([]));
        return await this.saveItem('history', []);
    }

    public addFavoriteShuttle(shuttle: Shuttle) {
        return this.setFavoriteShuttles(this.favoriteShuttles.getValue().push(shuttle));
    }

    public removeFavoriteShuttle(shuttle: Shuttle) {
        return this.setFavoriteShuttles(this.favoriteShuttles.getValue()
            .delete(this.favoriteShuttles.getValue()
                .findIndex(s => s._id === shuttle._id)));
    }

    private setFavoriteShuttles(shuttles: List<Shuttle>) {
        this._favoriteShuttles.next(shuttles);
        return this.saveItem('favoriteShuttles', shuttles.toArray());
    }

    public addBlacklistedShuttle(shuttle: Shuttle) {
        return this.setBlacklistedShuttles(this.blacklistedShuttles.getValue().push(shuttle));
    }

    public removeBlacklistedShuttle(shuttle: Shuttle) {
        return this.setBlacklistedShuttles(this.blacklistedShuttles.getValue()
            .delete(this.blacklistedShuttles.getValue()
                .findIndex(s => s._id === shuttle._id)));
    }

    private setBlacklistedShuttles(shuttles: List<Shuttle>) {
        this._blacklistedShuttles.next(shuttles);
        return this.saveItem('blacklistedShuttles', shuttles.toArray());
    }

    public getSoftLoginCredentials(): Promise<any> {
        if (this.softLoginCredentials) {
            return Promise.resolve(this.softLoginCredentials);
        } else {
            return new Promise(async (resolve) => {
                this.softLoginCredentials = await this.storage.get('softLoginCredentials');
                resolve(this.softLoginCredentials);
            });
        }
    }

    public async saveSoftLoginCredentials(softLoginCredentials: any) {
        this.softLoginCredentials = softLoginCredentials;
        await this.saveItem('softLoginCredentials', softLoginCredentials);
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
