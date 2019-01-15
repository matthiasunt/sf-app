import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Plugins} from '@capacitor/core';
import {UserDbService} from '../user-db/user-db.service';
import {District} from '../../models/district';
import {getIndexOfShuttle} from '../../tools/sf-tools';
const {Storage} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class LocalDataService {

    private softLoginCredentials: any;
    private preferredLanguge: string;
    private usedDistricts: District[];

    // All shuttles called last
    private succceededShuttleHistory: any[];

    // All called shuttles
    private history: any[];

    private numberOfCalls: number;

    private favorites: any[];
    private blacklist: any[];


    private directMode: boolean;

    private usersFirstStart: boolean;

    private appOpened: number;


    constructor(
        private http: HttpClient,
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

        val = await this.storage.get('used_districts');
        // Delete districts in old format
        if (val && val[0] && val[0].name[0]) {
            this.usedDistricts = [];
            this.storage.set('used_districts', this.usedDistricts).catch((err) => console.error(err));
        } else {
            this.usedDistricts = val ? val : [];
        }
        this.getHistory();
        val = await this.storage.get('favorites');
        this.favorites = val ? val : [];
        val = await this.storage.get('blacklist');
        this.blacklist = val ? val : [];
        val = await this.storage.get('number_of_calls');
        this.numberOfCalls = val ? val : 0;
        val = await this.storage.get('app_opened');
        this.appOpened = val ? val : 0;
    }

    public getSoftLoginCredentials(): Promise<any> {
        if (this.softLoginCredentials) {
            return Promise.resolve(this.softLoginCredentials);
        } else {
            return new Promise(async (resolve) => {
                const val = await this.storage.get('softlogin_credentials');
                console.log(val);
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
        if (this.usedDistricts) {
            return Promise.resolve(this.usedDistricts);
        } else {
            return new Promise((resolve) => {
                this.storage.get('used_districts').then((val) => {
                    resolve(val);
                });
            });
        }
    }

    setRecentlyUsedDistrict(district) {
        setTimeout(() => {

            if (this.usedDistricts.length === 0) {
                this.usedDistricts[0] = district;
            } else {
                // prevent 2 same districts
                if (this.usedDistricts[0]._id !== district._id) {
                    this.usedDistricts[1] = this.usedDistricts[0];
                    this.usedDistricts[0] = district;
                }
            }
            this.storage.ready().then(() => {
                this.storage.set('used_districts', this.usedDistricts)
                    .catch((err) => console.error(err));
            });
        }, 500);
    }

    setPrefLang(lang) {
        this.preferredLanguge = lang;
        localStorage.setItem('pref_lang', lang);
    }

    getPrefLang() {
        return this.preferredLanguge;
    }

    public async setDirectMode(directMode: boolean) {
        this.directMode = directMode;
        this.storage.ready().then(() => {
            this.storage.set('direct_mode', this.directMode)
                .catch((err) => console.error(err));
        });
    }

    public getNumberOfCalls(): number {
        return this.numberOfCalls;
    }

    public incrementNumberOfCalls() {
        this.numberOfCalls++;
        this.storage.set('number_of_calls', this.numberOfCalls)
            .catch((err) => console.error(err));
    }


    public addShuttleToHistory(shuttle: any) {
        this.incrementNumberOfCalls();
        this.history.push({shuttle: shuttle, date: new Date()});
        this.storage.ready().then(() => {
            this.storage.set('history', this.history)
                .catch((err) => console.error(err));
        });
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
        if (getIndexOfShuttle(this.blacklist, shuttle) == -1) {
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


    public inDirectMode(): boolean {
        return this.directMode;
    }

    public getAppOpenend(): number {
        return this.appOpened;
    }

}
