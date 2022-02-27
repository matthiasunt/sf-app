import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

import {Device, DeviceId, DeviceInfo} from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private info: DeviceInfo;

  constructor(private appVersion: AppVersion) {
    this.getInfo();
  }

  public async getInfo(): Promise<DeviceInfo> {
    if (this.info) {
      return this.info;
    } else {
      return await this.fetchInfo();
    }
  }

  public async getPlatform(): Promise<string> {
    if (!this.info) {
      await this.getInfo();
    }
    return this.info.platform;
  }

  public async getUuid(): Promise<string> {
    const deviceId: DeviceId = await Device.getId();
    return deviceId.uuid;
  }

  public getAppVersion(): Promise<string> {
    return this.appVersion.getVersionNumber();
  }

  public async isDevice(): Promise<boolean> {
    if (!this.info) {
      await this.getInfo();
    }
    return (
      (await this.getPlatform()) === 'android' ||
      (await this.getPlatform()) === 'ios'
    );
  }

  private async fetchInfo(): Promise<DeviceInfo> {
    this.info = await Device.getInfo();
    return this.info;
  }
}
