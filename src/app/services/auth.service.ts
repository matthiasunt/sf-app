import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { LocalDataService } from '@services/data/local-data.service';
import { UserDbService } from '@services/data/user-db.service';
import { ENV } from '@env';
import { DeviceService } from '@services/device.service';

import * as hash from 'hash.js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string;
  private headers: HttpHeaders;
  private userId: string;

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private localData: LocalDataService,
    private userDb: UserDbService
  ) {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.fetchUuid();
    this.url = ENV.API_URL;
  }

  private static hashString(str): string {
    return hash.sha256().update(str).digest('hex').substr(0, 16);
  }

  public async doSoftLogin() {
    const uuid = await this.fetchUuid();
    this.userId = AuthService.hashString(uuid);

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

  public async getUserId(): Promise<string> {
    if (this.userId) {
      return this.userId;
    } else {
      const uuid = await this.fetchUuid();
      this.userId = AuthService.hashString(uuid);
      return this.userId;
    }
  }

  private async fetchUuid(): Promise<string> {
    let uuid: string;
    if (await this.deviceService.isDevice()) {
      uuid = await this.deviceService.getUuid();
    } else {
      uuid = 'browser-uuid-2';
    }
    return uuid;
  }

  public register(user: any): Promise<any> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return new Promise((resolve) => {
      this.http
        .post(this.url + '/auth/register', JSON.stringify(user), {
          headers: this.headers,
        })
        .subscribe(
          (res) => {
            console.log('Registration done');
            this.localData.saveSoftLoginCredentials({
              username: user.username,
              password: user.password,
            });
            this.userDb.init(res);
            resolve(res);
          },
          (err) => {
            this.userDb.unableToLogin();
            console.log(err);
            resolve(err);
          }
        );
    });
  }

  public login(credentials: any): Promise<any> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return new Promise((resolve) => {
      this.http
        .post(this.url + '/auth/login', JSON.stringify(credentials), {
          headers: this.headers,
        })
        .subscribe(
          (res) => {
            this.userDb.init(res);
            resolve(res);
          },
          (err) => {
            console.log('Login error!');
            console.log(err);
            if (err.status === 401) {
              console.log('401 Unauthorized');
            }
            this.userDb.unableToLogin();
            resolve(err);
          }
        );
    });
  }
}
