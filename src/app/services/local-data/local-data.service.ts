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
    private preferredLanguge: string;
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
        this.preferredLanguge = localStorage.getItem('pref_lang');
        await this.storage.ready();


        let val = await this.storage.get('direct_mode');
        this.directMode = val ? val : false;

        val = await this.storage.get('recent_districts');
        this.recentDistricts = val ? val : [];
        this.getHistory();
        val = await this.storage.get('favorites');
        this.favorites = val ? val : [];
        val = await this.storage.get('blacklist');
        this.blacklist = val ? val : [];
        val = await this.storage.get('number_of_calls');
        this.numberOfCalls = val ? val : 0;
    }

    public getSoftLoginCredentials(): Promise<any> {
        if (this.softLoginCredentials) {
            return Promise.resolve(this.softLoginCredentials);
        } else {
            return new Promise(async (resolve) => {
                const val = await this.storage.get('softlogin_credentials');
                this.softLoginCredentials = val;
                resolve(this.softLoginCredentials);
            });
        }
    }

    public saveSoftLoginCredentials(credentials: any): any {
        this.softLoginCredentials = credentials;
        this.storage.set('softlogin_credentials', credentials);
    }

    public getRecentlyUsedDistricts(): Promise<District[]> {
        if (this.recentDistricts) {
            return Promise.resolve(this.recentDistricts);
        } else {
            return new Promise((resolve) => {
                this.storage.get('recent_districts').then((val) => {
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
            await this.storage.ready();
            await this.storage.set('recent_districts', this.recentDistricts);
        }, 500);
    }

    public getPrefLang() {
        return this.preferredLanguge;
    }

    public setPrefLang(lang) {
        this.preferredLanguge = lang;
        localStorage.setItem('pref_lang', lang);
    }

    public getLocaleFromPrefLang(): string {
        if (this.preferredLanguge === 'de_st') {
            return 'de_st';
        } else if (!this.preferredLanguge) {
            return this.translate.getBrowserLang();
        }
        return this.preferredLanguge;
    }

    public async addShuttleToHistory(shuttle: any) {
        this.incrementNumberOfCalls();
        this.history.push({shuttle: shuttle, date: new Date()});
        await this.storage.ready();
        await this.storage.set('history', this.history);
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

    public setFavorites(favorites: any) {
        this.favorites = favorites;
        this.storage.ready().then(() => {
            this.storage.set('favorites', this.favorites)
                .catch((err) => console.error(err));
        });
    }

    public addFavorite(shuttle: any): boolean {
        if (getIndexOfShuttle(this.favorites, shuttle) === -1) {
            this.userDb.putFavorite(shuttle);
            this.favorites.push(shuttle);
            this.storage.ready().then(() => {
                this.storage.set('favorites', this.favorites)
                    .catch((err) => console.error(err));
            });
            return true;
        } else {
            console.log('error adding favorite');
            return false;
        }
    }

    public removeShuttleFromFavorites(shuttle: any): boolean {
        const index = getIndexOfShuttle(this.favorites, shuttle);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            this.storage.ready().then(() => {
                this.storage.set('favorites', this.favorites)
                    .catch((err) => console.error(err));
            });
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

    public addBlacklisted(shuttle: any) {
        if (getIndexOfShuttle(this.blacklist, shuttle) === -1) {
            this.userDb.putBlacklisted(shuttle);
            this.blacklist.push(shuttle);
            this.storage.ready().then(() => {
                this.storage.set('blacklist', this.blacklist)
                    .catch((err) => console.error(err));
            });
        }
    }

    public removeShuttleFromBlacklist(shuttle: any) {
        const index = getIndexOfShuttle(this.blacklist, shuttle);
        if (index !== -1) {
            this.blacklist.splice(index, 1);
            this.storage.ready().then(() => {
                this.storage.set('blacklist', this.blacklist)
                    .catch((err) => console.error(err));
            });
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
        await this.storage.ready();
        await this.storage.set('direct_mode', this.directMode);
    }

    public getNumberOfCalls(): number {
        return this.numberOfCalls;
    }

    public async incrementNumberOfCalls() {
        this.numberOfCalls++;
        await this.storage.set('number_of_calls', this.numberOfCalls);
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
