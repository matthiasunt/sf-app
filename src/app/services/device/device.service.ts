import {Injectable} from '@angular/core';
import {DeviceInfo, Plugins, StatusBarStyle} from '@capacitor/core';
import {getContrastColor, shadeHexColor} from '@tools/sf-tools';

const {StatusBar} = Plugins;
const {Device} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    private info: DeviceInfo;

    constructor() {
        this.getInfo();
    }

    public async styleStatusBar(color: string) {
        if (await this.getPlatform() === 'android') {
            const backgroundColor = shadeHexColor(color, -0.08);
            const style = getContrastColor(backgroundColor) === 'white'
                ? StatusBarStyle.Dark : StatusBarStyle.Light;
            setTimeout(() => {
                StatusBar.setStyle({style});
                StatusBar.setBackgroundColor({color: backgroundColor});
            }, 250);
        }
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
        console.log(this.info);
        return this.info;
    }


}
