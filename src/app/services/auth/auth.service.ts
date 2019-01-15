import {Injectable} from '@angular/core';
import {Plugins} from '@capacitor/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {hash} from 'hash-js';
import {LocalDataService} from '../local-data/local-data.service';
import {UserDbService} from '../user-db/user-db.service';
import {ENV} from '../../../environments/environment';

const {Device} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private url: string;
    private headers: HttpHeaders;
    private deviceInfo: any;

    constructor(
        private http: HttpClient,
        private localData: LocalDataService,
        private userDb: UserDbService,
    ) {
        this.headers = new HttpHeaders().set('Content-Type', 'application/json');
        this.url = ENV.API_URL;
        this.fetchDeviceInfo();

    }

    private async fetchDeviceInfo() {
        this.deviceInfo = await Device.getInfo();
    }

    public async doSoftLogin() {

        let uuid: string;
        if (!this.deviceInfo.isVirtual) {
            uuid = this.deviceInfo.uuid;
        } else {
            uuid = 'browser-uuid';
        }

        const id = this.hashString(uuid);
        const user = {
            username: id,
            email: id + '@shuttlefinder.it',
            password: 'softlogin',
            confirmPassword: 'softlogin'
        };
        const loginRes = await this.login(user);

        if (loginRes.status === 401) {
            this.register(user);
        }
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
                    console.log('Logged in');
                    this.userDb.init(res);
                    resolve(res);
                }, (err) => {
                    console.log('Login error!');
                    console.log(err);
                    if (err.status == 401) {
                        console.log('401 Unauthorized');
                    }
                    resolve(err);
                });
        });
    }

}
