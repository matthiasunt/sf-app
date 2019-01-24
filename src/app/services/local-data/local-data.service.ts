import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {District} from '../../models/district';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {UserDbService} from '../user-db/user-db.service';
import {TranslateService} from '@ngx-translate/core';

import {getIndexOfShuttle} from '../../tools/sf-tools';

@Injectable({
    providedIn: 'root'
})
export class LocalDataService {

    private softLoginCredentials: any;
    private lang: string;
    private recentDistricts: District[];
    private history: any[];
    private favorites: any[];
    private blacklist: any[];
    private numberOfCalls: number;
    private directMode: boolean;


    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private platform: Platform,
        private storage: Storage,
        private userDb: UserDbService,
    ) {

        // using normal local storage, much faster
        this.fetchData();
    }

    private async fetchData() {
        this.lang = localStorage.getItem('lang');
        await this.storage.ready();


        let val = await this.storage.get('directMode');
        this.directMode = val ? val : false;

        val = await this.storage.get('recentDistricts');
        this.recentDistricts = val ? val : [];
        this.getHistory();
        val = await this.storage.get('favorites');
        this.favorites = val ? val : [];
        val = await this.storage.get('blacklist');
        this.blacklist = val ? val : [];
        val = await this.storage.get('numberOfCalls');
        this.numberOfCalls = val ? val : 0;
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

    public saveSoftLoginCredentials(softLoginCredentials: any): any {
        this.softLoginCredentials = softLoginCredentials;
        this.saveItem('softLoginCredentials', softLoginCredentials);
    }

    public getRecentlyUsedDistricts(): Promise<District[]> {
        if (this.recentDistricts) {
            return Promise.resolve(this.recentDistricts);
        } else {
            return new Promise((resolve) => {
                this.storage.get('recentDistricts').then((val) => {
                    resolve(val);
                });
            });
        }
    }

    public async setRecentlyUsedDistrict(district) {
        setTimeout(async () => {
            if (this.recentDistricts.length === 0) {
                this.recentDistricts[0] = district;
            } else {
                // prevent 2 same districts
                if (this.recentDistricts[0]._id !== district._id) {
                    this.recentDistricts[1] = this.recentDistricts[0];
                    this.recentDistricts[0] = district;
                }
            }
            this.saveItem('recentDistricts', this.recentDistricts);
        }, 500);
    }

    public getPrefLang() {
        return this.lang;
    }

    public setPrefLang(lang) {
        this.lang = lang;
        localStorage.setItem('lang', lang);
    }

    public getLocaleFromPrefLang(): string {
        if (this.lang === 'de_st') {
            return 'de';
        } else if (!this.lang) {
            return this.translate.getBrowserLang();
        }
        return this.lang;
    }

    public async addShuttleToHistory(shuttle: any) {
        this.incrementNumberOfCalls();
        this.history.push({shuttle: shuttle, date: new Date()});
        await this.saveItem('history', this.history);
    }

    public getHistory(): Promise<any[]> {
        if (this.history) {
            return Promise.resolve(this.history);
        } else {
            return new Promise((resolve) => {
                this.storage.get('history').then((val) => {
                    this.history = val ? val : [];
                    resolve(this.history);
                });
            });
        }
    }

    public clearShuttleHistory() {
        this.storage.remove('history');
        this.history = null;
    }

    public shuttleCalledLately(shuttle: any): boolean {
        if (this.history && this.history.length > 0) {
            for (const e of this.history) {
                if (e.shuttle) {
                    if (e.shuttle.phone === shuttle.phone &&
                        ((new Date().getTime() - new Date(e.date).getTime()) / 36e5 < 0.5)) {
                        return true;
                    }
                } else {
                    console.log('Shuttle undefined');
                }
            }
        }
        return false;
    }

    public getFavorites() {
        return this.favorites;
    }

    public async setFavorites(favorites: any) {
        this.favorites = favorites;
        await this.saveItem('favorites', this.favorites);
    }

    public async addFavorite(shuttle: any): Promise<boolean>{
        if (getIndexOfShuttle(this.favorites, shuttle) === -1) {
            this.userDb.putFavorite(shuttle);
            this.favorites.push(shuttle);
            await this.saveItem('favorites', this.favorites);
            return true;
        } else {
            console.log('error adding favorite');
            return false;
        }
    }

    public async removeShuttleFromFavorites(shuttle: any): Promise<boolean> {
        const index = getIndexOfShuttle(this.favorites, shuttle);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            await this.saveItem('favorites', this.favorites);
            if (this.userDb.getUserId()) {
                this.userDb.removeDoc({_id: this.userDb.getUserId() + '-' + 'favorite' + '-' + shuttle._id});
            } else {
                console.log('uid not defined');
            }
            return true;
        } else {
            console.log('shuttle not found');
            return false;
        }
    }

    public getBlacklist() {
        return this.blacklist;
    }

    public async addBlacklisted(shuttle: any) {
        if (getIndexOfShuttle(this.blacklist, shuttle) === -1) {
            this.userDb.putBlacklisted(shuttle);
            this.blacklist.push(shuttle);
            await this.saveItem('blacklist', this.blacklist);
        }
    }

    public async removeShuttleFromBlacklist(shuttle: any) {
        const index = getIndexOfShuttle(this.blacklist, shuttle);
        if (index !== -1) {
            this.blacklist.splice(index, 1);
            await this.saveItem('blacklist', this.blacklist);
            if (this.userDb.getUserId()) {
                this.userDb.removeDoc({_id: this.userDb.getUserId() + '-' + 'blacklisted' + '-' + shuttle._id});
            } else {
                console.log('uid not defined');
            }
        }
    }


    public getDirectMode(): boolean {
        return this.directMode;
    }

    public async setDirectMode(directMode: boolean) {
        this.directMode = directMode;
        await this.saveItem('directMode', this.directMode);
    }

    public getNumberOfCalls(): number {
        return this.numberOfCalls;
    }

    public async incrementNumberOfCalls() {
        this.numberOfCalls++;
        await this.saveItem('numberOfCalls', this.numberOfCalls);
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
