import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import getDistance from 'geolib/es/getDistance';

import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { DeviceService } from '@services/device.service';
import { MyCoordinates } from '@models/my-coordinates';

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  private position: { coordinates: MyCoordinates; time: Date };

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private nativeGeocoder: NativeGeocoder
  ) {}

  public async getCurrentPosition(): Promise<MyCoordinates> {
    /* If position not obtained yet or older than 1 minute */
    if (
      !this.position ||
      (new Date().getTime() - this.position.time.getTime()) / 1000 > 60 * 2
    ) {
      if (await this.deviceService.isDevice()) {
        const res = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
        const coordinates = {
          latitude: res.coords.latitude,
          longitude: res.coords.longitude,
        };
        this.position = { coordinates, time: new Date() };
        return coordinates;
      }
    } else {
      return this.position.coordinates;
    }
  }

  public async getLocalityName(
    coordinates: MyCoordinates,
    lang: string
  ): Promise<string> {
    if (await this.deviceService.isDevice()) {
      try {
        const res: any[] = await this.nativeGeocoder.reverseGeocode(
          coordinates.latitude,
          coordinates.longitude,
          { useLocale: true, defaultLocale: lang, maxResults: 5 }
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
    if (GeoService.checkPosition(pos1) && GeoService.checkPosition(pos2)) {
      return getDistance(pos1, pos2);
    }
  }

  // tool
  private static checkPosition(pos) {
    return (
      pos &&
      pos.latitude &&
      pos.longitude &&
      pos.latitude.toString().length > 0 &&
      pos.longitude.toString().length > 0 &&
      pos.latitude.toString().indexOf('.') !== -1 &&
      pos.longitude.toString().indexOf('.') !== -1
    );
  }

  public static getBeatifulCityName(name: string): string {
    let ret = name;
    const toRemove = [
      'Valgardena',
      "all' Isarco",
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
      'in Passeier',
    ];
    for (const s of toRemove) {
      if (ret) {
        ret = ret.replace(new RegExp(s, 'ig'), '').trim();
      }
    }
    return ret;
  }
}
