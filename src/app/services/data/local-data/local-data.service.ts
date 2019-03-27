import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';

import {HistoryElement} from '@models/history-element';
import {BehaviorSubject} from 'rxjs';
import {List} from 'immutable';

@Injectable({
    providedIn: 'root'
})
export class LocalDataService {

    private softLoginCredentials: any;
    private _lang: BehaviorSubject<string> = new BehaviorSubject(this.translate.getBrowserLang());
    private _history: BehaviorSubject<List<HistoryElement>> = new BehaviorSubject(List([]));

    private numberOfCalls: number;
    private directMode: boolean;


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

    private async fetchData() {
        await this.storage.ready();
        let val = await this.storage.get('directMode');
        this.directMode = val ? val : false;

        // Language Setting
        val = await this.getItem('lang');
        if (val) {
            this._lang.next(val);
        }

        // Shuttle Call History
        val = await this.getItem('history');
        if (val) {
            this._history.next(List(val));
        }

        val = await this.storage.get('numberOfCalls');
        this.numberOfCalls = val ? val : 0;
    }

    /**
     *
     * @param historyElement
     */
    public async addToHistory(historyElement: HistoryElement) {
        this._history.next(this._history.value.insert(0, historyElement));
        return await this.saveItem('history', this._history.value.toArray());
    }

    /**
     *
     */
    public async clearHistory() {
        this._history.next(List([]));
        return await this.saveItem('history', []);
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

    public getLocaleFromPrefLang(): string {
        if (this._lang.value === 'de_st') {
            return 'de';
        }
        return this._lang.value;
    }

    public shuttleCalledLately(shuttleId: string): boolean {
        const calledLast = this.history.value.filter((h) => {
            return ((new Date().getTime() - new Date(h.date).getTime()) / 36e5 < 0.5);
        });
        return calledLast.findIndex((c) => c.shuttle._id === shuttleId) > -1;
    }


    public getDirectMode(): boolean {
        return this.directMode;
    }

    public async setDirectMode(directMode: boolean) {
        this.directMode = directMode;
        return await this.saveItem('directMode', this.directMode);
    }

    public getNumberOfCalls(): number {
        return this.numberOfCalls;
    }

    public async incrementNumberOfCalls() {
        this.numberOfCalls++;
        return await this.saveItem('numberOfCalls', this.numberOfCalls);
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
