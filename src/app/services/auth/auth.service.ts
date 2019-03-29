import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';

import {LocalDataService} from '../data/local-data/local-data.service';
import {UserDbService} from '../data/user-db/user-db.service';
import {ENV} from '@env';
import {DeviceService} from '@services/device/device.service';

const hash = require('hash.js');

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url: string;
    private headers: HttpHeaders;
    private userId: string;

    constructor(
        private http: HttpClient,
        private uniqueDeviceID: UniqueDeviceID,
        private deviceService: DeviceService,
        private localData: LocalDataService,
        private userDb: UserDbService,
    ) {
        this.headers = new HttpHeaders().set('Content-Type', 'application/json');
        this.fetchUuid();
        this.url = ENV.API_URL;
    }

    public async doSoftLogin() {

        const uuid = await this.fetchUuid();
        this.userId = this.hashString(uuid);

        const user = {
            username: this.userId,
            email: this.userId + '@shuttlefinder.app',
            password: 'softlogin',
            confirmPassword: 'softlogin',
            uuid: uuid,
        };
        try {
            const loginRes = await this.login(user);
            if (loginRes.status === 401) {
                const res = await this.register(user);
                console.log(res);
            }
        } catch (err) {
            console.error(err);
        }
    }

    public async getUserId() {
        if (this.userId) {
            return this.userId;
        } else {
            const uuid = await this.fetchUuid();
            this.userId = this.hashString(uuid);
            return this.userId;
        }
    }

    private async fetchUuid() {
        let uuid: string;
        // if (await this.deviceService.isDevice()) {
            uuid = await this.uniqueDeviceID.get();
        // } else {
        //     uuid = 'browser-uuid-2';
        // }
        console.log(uuid);
        return uuid;
    }

    private hashString(str): string {
        return hash.sha256().update(str).digest('hex').substr(0, 16);
    }

    public register(user: any): Promise<any> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return new Promise((resolve) => {
            this.http.post(this.url + '/auth/register', JSON.stringify(user), {headers: this.headers})
                .subscribe(res => {
                    console.log('Registration done');
                    this.localData.saveSoftLoginCredentials({
                        username: user.username,
                        password: user.password
                    });
                    this.userDb.init(res);
                    resolve(res);
                }, (err) => {
                    this.userDb.unableToLogin();
                    console.log(err);
                    resolve(err);
                });
        });
    }

    public login(credentials: any): Promise<any> {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return new Promise((resolve) => {
            this.http.post(this.url + '/auth/login', JSON.stringify(credentials), {headers: this.headers})
                .subscribe(res => {
                    this.userDb.init(res);
                    resolve(res);
                }, (err) => {
                    console.log('Login error!');
                    console.log(err);
                    if (err.status === 401) {
                        console.log('401 Unauthorized');
                    }
                    this.userDb.unableToLogin();
                    resolve(err);
                });
        });
    }

}
