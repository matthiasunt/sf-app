import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {District} from '../../../models/district';
import {Platform} from '@ionic/angular';
import {Storage} from '@ionic/storage';
import {UserDbService} from '../user-db/user-db.service';
import {TranslateService} from '@ngx-translate/core';
import {Shuttle} from '../../../models/shuttle';

@Injectable({
    providedIn: 'root'
})
export class LocalDataService {

    private softLoginCredentials: any;
    private lang: string;
    private recentDistricts: District[];
    private history: any[];

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
