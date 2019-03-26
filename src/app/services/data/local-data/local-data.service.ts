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
export class LocalDataService {

    private softLoginCredentials: any;
    private lang: string;
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

    get history() {
        return this._history;
    }

    private async fetchData() {
        await this.storage.ready();
        let val = await this.storage.get('directMode');
        this.directMode = val ? val : false;
        val = await this.getLang();
        this.lang = val ? val : this.translate.getBrowserLang();
        val = await this.getItem('history');
        console.log(val);
        if (val) {
            this.history.next(List(val));
        }

        val = await this.storage.get('numberOfCalls');
        this.numberOfCalls = val ? val : 0;
    }

    public async addToHistory(historyElement: HistoryElement) {
        this.history.next(this.history.value.insert(0, historyElement));
        console.log(this.history.value);
        return await this.saveItem('history', this.history.value.toArray());
    }

    public async clearHistory() {
        this.history.next(List([]));
        return await this.saveItem('history', []);
    }

    public getSoftLoginCredentials(): Promise<any> {
        if (this.softLoginCredentials) {
            return Promise.resolve(this.softLoginCredentials);
        } else {
            return new Promise(async (resolve) => {
                const val = await this.storage.get('softLoginCredentials');
                this.softLoginCredentials = val;
                resolve(this.softLoginCredentials);
            });
        }
    }

    public async saveSoftLoginCredentials(softLoginCredentials: any) {
        this.softLoginCredentials = softLoginCredentials;
        await this.saveItem('softLoginCredentials', softLoginCredentials);
    }

    public async getLang(): Promise<string> {
        const ret = this.lang ? this.lang : await this.getItem('lang');
        this.lang = ret;
        return ret;
    }

    public async setLang(lang: string) {
        this.lang = lang;
        await this.saveItem('lang', lang);
    }

    public getLocaleFromPrefLang(): string {
        if (this.lang === 'de_st') {
            return 'de';
        } else if (!this.lang) {
            return this.translate.getBrowserLang();
        }
        return this.lang;
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
