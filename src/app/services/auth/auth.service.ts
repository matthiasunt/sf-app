import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';

import {LocalDataService} from '../data/local-data/local-data.service';
import {UserDbService} from '../data/user-db/user-db.service';
import {ENV} from '@env';

const hash = require('hash.js');

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url: string;
    private headers: HttpHeaders;
    private deviceInfo: any;
    private userId: string;

    constructor(
        private http: HttpClient,
        private uniqueDeviceID: UniqueDeviceID,
        private localData: LocalDataService,
        private userDb: UserDbService,
    ) {
        this.headers = new HttpHeaders().set('Content-Type', 'application/json');
        this.url = ENV.API_URL;
    }

    public async doSoftLogin() {

        let uuid: string;
        // if (!this.deviceInfo.isVirtual) {
        //     uuid = await this.uniqueDeviceID.get();
        //     uuid = this.deviceInfo.uuid;
        // } else {
        uuid = 'browser123';
        // }
        const id = this.hashString(uuid);
        this.userId = id;
        const user = {
            username: id,
            email: id + '@shuttlefinder.it',
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

    public getUserId() {
        return this.userId;
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
                    resolve(err);
                });
        });
    }

}
