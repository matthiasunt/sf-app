import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {getDistance} from 'geolib';
import {NativeGeocoder, NativeGeocoderReverseResult} from '@ionic-native/native-geocoder/ngx';
import {DeviceService} from '../device/device.service';
import {Coordinates} from '../../models/coordinates';
import {Platform} from '@ionic/angular';

import {Geolocation} from '@ionic-native/geolocation/ngx';

@Injectable({
    providedIn: 'root'
})
export class GeoService {

    private position: any;
    private geocodedCityName: any;

    constructor(
        private http: HttpClient,
        private platform: Platform,
        private deviceService: DeviceService,
        private geolocation: Geolocation,
        private nativeGeocoder: NativeGeocoder,
    ) {
        this.getCurrentPosition();
        if (this.deviceService.getPlatform() !== 'web') {

        }
    }

    public async getCurrentPosition() {
        if (this.deviceService.isDevice()) {
            // await this.platform.ready();
            const res = await this.geolocation.getCurrentPosition({enableHighAccuracy: true});
            console.log(res);
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

    // public async getGeocodedCityName(coordinates: Coordinates, lang: string): Promise<string> {
    //     const data = await this.http.get(`https://maps.google.com/maps/api/geocode/json?`
    //         + `latlng=${coordinates.latitude},${coordinates.longitude}`
    //         + `&language=${lang}`
    //         + `&key=${ENV.GEOCODE_API_KEY}`).toPromise();
    //     const name: string = this.getLocalityName(data['results']);
    //     this.geocodedCityName = {
    //         name: name,
    //         lang: lang,
    //     };
    //     console.log(name);
    //     return this.getBeatifulCityName(name);
    // }


    // private getLocalityName(apiResults: any[]): any {
    //     if (apiResults) {
    //         for (const r of apiResults) {
    //             if (r.types.indexOf('administrative_area_level_3') > -1
    //                 && r.types.indexOf('political') > -1) {
    //                 for (const c of r.address_components) {
    //                     if (c.types.indexOf('administrative_area_level_3') > -1
    //                         && c.types.indexOf('political') > -1) {
    //                         return c.short_name;
    //                     }
    //                 }
    //             }
    //         }
    //     } else {
    //         console.log('Google API result undefined');
    //     }
    // }


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

    private getRandomPosition() {
        const rLat = this.getRandom(4596669237, 4702921307) * Math.pow(10, -8);
        const rLng = this.getRandom(1007811939, 1279174244) * Math.pow(10, -8);
        this.position = {
            latitude: rLat,
            longitude: rLng,
            timestamp: new Date().getTime(),
        };
        return this.position;

    }

    private getRandom(min: number, max: number): number {
        const ret = Math.floor(Math.random() * (max - min) + min);
        return ret;
    }

    // public async getPosition(): Promise<any> {
    //     // // if position already here and not older than 3 minutes
    //     // if (this.position
    //     //     && (new Date().getTime() - this.position.timestamp) < 1000 * 60 * 2) {
    //     //     return this.position;
    //     // }
    //     // const res = await this.geolocation.getCurrentPosition(
    //     //     {enableHighAccuracy: true}
    //     // );
    //     //
    //     // this.position = {
    //     //     latitude: res.coords.latitude,
    //     //     longitude: res.coords.longitude,
    //     //     timestamp: new Date().getTime(),
    //     // };
    //     // return this.position;
    //
    // }

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
