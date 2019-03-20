import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {getDistance} from 'geolib';
import {NativeGeocoder, NativeGeocoderReverseResult} from '@ionic-native/native-geocoder/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {DeviceService} from '@services/device/device.service';
import {Coordinates} from '@models/coordinates';


@Injectable({
    providedIn: 'root'
})
export class GeoService {

    private position: any;
    private geocodedCityName: any;

    constructor(
        private http: HttpClient,
        private deviceService: DeviceService,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
    ) {
    }

    public async getCurrentPosition() {
        if (this.deviceService.isDevice()) {
            const res = await this.geolocation.getCurrentPosition({enableHighAccuracy: true});
            return res.coords;
        } else {
            return this.getRandomPosition();
        }
    }

    public async getLocalityName(coordinates: Coordinates, lang: string): Promise<string> {
        if (this.deviceService.isDevice()) {
            try {
                const res: NativeGeocoderReverseResult[] = await this.nativeGeocoder.reverseGeocode(
                    parseFloat(coordinates.latitude),
                    parseFloat(coordinates.longitude),
                    {useLocale: true, defaultLocale: lang, maxResults: 5}
                );
                return res[0].locality;
            } catch (err) {
                console.error(err);
            }
        } else {
            return '';
        }
    }

    /*
      Takes two positions and returns the distance in meters
    */
    public getDistance(pos1: any, pos2: any): number {
        if (this.checkPosition(pos1) && this.checkPosition(pos2)) {
            return getDistance(pos1, pos2, 1, 1);
        }
    }

    // tool
    private checkPosition(pos) {
        if (pos &&
            pos.latitude && pos.longitude &&
            pos.latitude.toString().length > 0 && pos.longitude.toString().length > 0
            && pos.latitude.toString().indexOf('.') !== -1 && pos.longitude.toString().indexOf('.') !== -1) {
            return true;
        } else {
            return false;
        }
    }

    private getRandomPosition(): Coordinates {
        const rLat = this.getRandom(4596669237, 4702921307) * Math.pow(10, -8);
        const rLng = this.getRandom(1007811939, 1279174244) * Math.pow(10, -8);
        this.position = {
            latitude: rLat,
            longitude: rLng
        };
        return this.position;

    }

    private getRandom(min: number, max: number): number {
        const ret = Math.floor(Math.random() * (max - min) + min);
        return ret;
    }

    public getBeatifulCityName(name: string): string {
        let ret = name;
        const toRemove = [
            'Valgardena',
            'all\' Isarco',
            'allo Sciliar',
            'in Badia',
            'Atesino',
            'sulla strada del vino',
            'in Passiria',
            'Venosta',
            'an der Weinstraße',
            'am Schlern',
            'in Gröden',
            'im Vinschgau',
            'in Passeier'
        ];
        for (const s of toRemove) {
            if (ret) {
                ret = ret.replace(new RegExp(s, 'ig'), '').trim();
            }
        }
        return ret;
    }

}
