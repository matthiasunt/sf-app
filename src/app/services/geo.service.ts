import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import getDistance from 'geolib/es/getDistance';

import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@capacitor/geolocation';
import { MyCoordinates } from '@models/my-coordinates';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  constructor(
    private http: HttpClient,
    private nativeGeocoder: NativeGeocoder
  ) {}

  async getCurrentPosition(): Promise<MyCoordinates> {
    if (Capacitor.isNativePlatform()) {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30 * 60 * 1000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    }
    return undefined;
  }

  async getLocalityName(
    coordinates: MyCoordinates,
    lang: string
  ): Promise<string> {
    try {
      const res = await this.nativeGeocoder.reverseGeocode(
        coordinates.latitude,
        coordinates.longitude,
        { useLocale: true, defaultLocale: lang, maxResults: 5 }
      );
      return res[0].locality;
    } catch (err) {
      console.error(err);
    }
    return '';
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
