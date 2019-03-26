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

    private position: { coordinates: Coordinates, time: Date };
    private geocodedCityName: any;

    constructor(
        private http: HttpClient,
        private deviceService: DeviceService,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
    ) {
    }

    public async getCurrentPosition(): Promise<Coordinates> {
        /* If position not obtained yet or older than 1 minute */
        if (!this.position || (new Date().getTime() - this.position.time.getTime()) / 1000 > (60 * 2)) {
            if (await this.deviceService.isDevice()) {
                const res = await this.geolocation.getCurrentPosition({enableHighAccuracy: true});
                const coordinates = {
                    latitude: res.coords.latitude,
                    longitude: res.coords.longitude
                };
                this.position = {coordinates, time: new Date()};
                return coordinates;

            } else {
                return this.getRandomPosition();
            }
        } else {
            return this.position.coordinates;
        }
    }

    public async getLocalityName(coordinates: Coordinates, lang: string): Promise<string> {
        if (await this.deviceService.isDevice()) {
            try {
                const res: NativeGeocoderReverseResult[] = await this.nativeGeocoder.reverseGeocode(
                    coordinates.latitude,
                    coordinates.longitude,
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
        const coordinates = {
            latitude: rLat,
            longitude: rLng
        };
        this.position = {coordinates, time: new Date()};
        return coordinates;

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
