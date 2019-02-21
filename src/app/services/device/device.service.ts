import {Injectable} from '@angular/core';
import {Plugins} from '@capacitor/core';

const {Device} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class DeviceService {

    private info: any;

    constructor() {
        this.fetchInfo();
    }

    public getInfo() {
        return this.info;
    }

    public getPlatform(): string {
        if (this.info) {
            return this.info.platform;
        }
    }

    private async fetchInfo() {
        this.info = await Device.getInfo();
    }


}
