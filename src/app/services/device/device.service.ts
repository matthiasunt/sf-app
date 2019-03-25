import {Injectable} from '@angular/core';
import {DeviceInfo, Plugins} from '@capacitor/core';

const {Device} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    private info: DeviceInfo;

    constructor() {
        this.getInfo();
    }

    public async getInfo(): Promise<DeviceInfo> {
        if (this.info) {
            return this.info;
        } else {
            return await this.fetchInfo();
        }
    }

    public async getPlatform() {
        if (!this.info) {
            await this.getInfo();
        }
        return this.info.platform;
    }

    public async getAppVersion() {
        if (!this.info) {
            await this.getInfo();
        }
        return this.info.appVersion;
    }

    public async isDevice() {
        if (!this.info) {
            await this.getInfo();
        }
        if (await this.getPlatform() === 'android' || await this.getPlatform() === 'ios') {
            return true;
        }
        return false;
    }

    private async fetchInfo() {
        this.info = await Device.getInfo();
        return this.info;
    }


}
