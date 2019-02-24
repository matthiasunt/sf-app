import {Injectable} from '@angular/core';
import {DeviceInfo, Plugins} from '@capacitor/core';

const {Device} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    private info: DeviceInfo;

    constructor() {
        this.fetchInfo();
    }

    public getInfo(): DeviceInfo {
        return this.info;
    }

    public getPlatform(): string {
        if (this.info) {
            return this.info.platform;
        }
    }

    public getAppVersion(): string {
        return this.info.appVersion;
    }

    public isDevice(): boolean {
        if (this.getPlatform() === 'android' || this.getPlatform() === 'ios') {
            return true;
        }
        return false;
    }

    private async fetchInfo() {
        this.info = await Device.getInfo();
    }


}
