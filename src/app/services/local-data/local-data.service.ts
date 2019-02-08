import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {District} from '../../models/district';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {UserDbService} from '../user-db/user-db.service';
import {TranslateService} from '@ngx-translate/core';
import {Shuttle} from '../../models/shuttle';

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
        this.fetchData();
    }

    private async fetchData() {


        await this.storage.ready();
        let val = await this.storage.get('directMode');
        this.directMode = val ? val : false;
        val = await this.getLang();
        this.lang = val ? val : this.translate.getBrowserLang();
        val = await this.storage.get('recentDistricts');
        this.recentDistricts = val ? val : [];
        val = await this.getItem('history');
        this.history = val ? val : [];
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

    public async saveSoftLoginCredentials(softLoginCredentials: any) {
        this.softLoginCredentials = softLoginCredentials;
        await this.saveItem('softLoginCredentials', softLoginCredentials);
    }

    public async getRecentDistricts(): Promise<District[]> {
        const ret = this.recentDistricts ? this.recentDistricts : await this.getItem('recentDistricts');
        return ret ? ret : [];
    }

    public async setRecentDistricts(district) {
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
            await this.saveItem('recentDistricts', this.recentDistricts);
        }, 500);
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

    // TODO: Add History Item Type
    public async addShuttleToHistory(shuttle: any) {
        this.incrementNumberOfCalls();
        this.history.push({shuttle: shuttle, date: new Date()});
        await this.saveItem('history', this.history);
    }

    public async getHistory(): Promise<any[]> {
        const ret = this.history ? this.history : await this.getItem('history');
        return ret ? ret : [];
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

    public async getFavorites(): Promise<Shuttle[]> {
        return this.favorites ? this.favorites : await this.getItem('favorites');
    }

    public isFavorite(shuttleId: string) {
        return this.favorites.findIndex((e) => e._id === shuttleId) > -1;
    }

    public async setFavorites(favorites: any) {
        this.favorites = favorites;
        await this.saveItem('favorites', this.favorites);
    }

    public async addFavorite(shuttle: any): Promise<boolean> {
        if (this.favorites.findIndex(e => e._id === shuttle._id) < 0) {
            this.userDb.putFavorite(shuttle);
            this.favorites.push(shuttle);
            console.log(this.favorites);
            await this.saveItem('favorites', this.favorites);
            return true;
        } else {
            console.log('Favorite already added');
            return false;
        }
    }

    public async removeFavorite(shuttle: any): Promise<boolean> {
        const index = this.favorites.findIndex(e => e._id === shuttle._id);
        if (index > -1) {
            this.favorites.splice(index, 1);
            await this.saveItem('favorites', this.favorites);
            if (this.userDb.getUserId()) {
                this.userDb.removeDoc({_id: this.userDb.getUserId() + '-' + 'favorite' + '-' + shuttle._id});
            } else {
                console.log('UserDB: uid not defined');
            }
            return true;
        } else {
            console.log('Local: shuttle not found');
            return false;
        }
    }

    public async getBlacklist(): Promise<Shuttle[]> {
        return this.blacklist ? this.blacklist : await this.getItem('blacklist');
    }

    public async addBlacklisted(shuttle: any) {
        const index = this.blacklist.findIndex(e => e._id === shuttle._id);
        if (index < 0) {
            this.userDb.putBlacklisted(shuttle);
            this.blacklist.push(shuttle);
            await this.saveItem('blacklist', this.blacklist);
        }
    }

    public async removeBlacklisted(shuttle: any) {
        const index = this.blacklist.findIndex(e => e._id === shuttle._id);
        if (index > -1) {
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
