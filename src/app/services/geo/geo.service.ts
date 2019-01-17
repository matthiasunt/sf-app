import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Plugins} from '@capacitor/core';
import {map} from 'rxjs/operators';
import {getDistance} from 'geolib';
import {ENV} from '@env';

const {Geolocation} = Plugins;

@Injectable({
    providedIn: 'root'
})
export class GeoService {

    private position: any;
    private geocodedCityName: any;

    constructor(
        private http: HttpClient,
    ) {
        this.getCurrentPosition();
    }
    private async getCurrentPosition() {
        // const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
        // console.log('Current', coordinates);
    }

    public async getCityName(lang: string): Promise<string> {
        const pos = await this.getCurrentPosition();
        return await this.getGeocodedCityName(pos, lang);
    }

    public getGeocodedCityName(position, lang: string): Promise<string> {
        return new Promise((resolve) => {
            this.http.get(`https://maps.google.com/maps/api/geocode/json?`
                + `latlng=${position.latitude},${position.longitude}`
                + `&language=${lang}`
                + `&key=${ENV.GEOCODE_API_KEY}`)
                .pipe(map(data => {
                })).subscribe(res => {
                console.log(res);
                this.geocodedCityName = {
                    name: this.getLocalityName(res['results']),
                    lang: lang,
                };
                resolve(this.geocodedCityName.name);
            });
        });
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
            'in Gröden',
            'im Vinschgau',
            'in Passeier'
        ];
        for (const s of toRemove) {
            ret = ret.replace(new RegExp(s, 'ig'), '').trim();
        }
        return ret;
    }

    private getLocalityName(apiResults: any[]): any {
        if (apiResults) {
            for (const r of apiResults) {
                if (r.types.indexOf('administrative_area_level_3') > -1
                    && r.types.indexOf('political') > -1) {
                    for (let c of r.address_components) {
                        if (c.types.indexOf('administrative_area_level_3') > -1
                            && c.types.indexOf('political') > -1) {
                            return c.short_name;
                        }
                    }
                }
            }
        } else {
            console.log('Google API result undefined');
        }
    }


    /*
      Takes two positions and returns the distance in meters
    */
    public getDistance(pos1: any, pos2: any): number {
        if (this.checkPosition(pos1) && this.checkPosition(pos2)) {
            return getDistance(pos1, pos2, 1, 1);
        } else {
            console.log('Positions incomplete');
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

    public getRandomPosition() {
        const rLat = this.getRandom(4596669237, 4702921307) * Math.pow(10, -8);
        const rLng = this.getRandom(1007811939, 1279174244) * Math.pow(10, -8);
        this.position = {
            latitude: rLat,
            longitude: rLng,
            timestamp: new Date().getTime(),
        };
        console.log(this.position);
        return this.position;

    }

    private getRandom(min: number, max: number): number {
        const ret = Math.floor(Math.random() * (max - min) + min);
        return ret;
    }

    public async getPosition(): Promise<any> {
        // // if position already here and not older than 3 minutes
        // if (this.position
        //     && (new Date().getTime() - this.position.timestamp) < 1000 * 60 * 2) {
        //     return this.position;
        // }
        // const res = await this.geolocation.getCurrentPosition(
        //     {enableHighAccuracy: true}
        // );
        //
        // this.position = {
        //     latitude: res.coords.latitude,
        //     longitude: res.coords.longitude,
        //     timestamp: new Date().getTime(),
        // };
        // return this.position;

    }

}
