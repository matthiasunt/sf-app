import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';

import { GeoService } from '@services/geo.service';
import { MyCoordinates } from '@models/my-coordinates';
import { Shuttle } from '@models/shuttle';
import { map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import { environment } from '@env';

@Injectable({
  providedIn: 'root',
})
export class ShuttlesService {
  private db = getFirestore(initializeApp(environment.firebase));
  private _allShuttles: BehaviorSubject<Shuttle[]> = new BehaviorSubject([]);

  private static sortByRankingScore(shuttles: Shuttle[]): Shuttle[] {
    return shuttles.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  constructor(private geoService: GeoService, public zone: NgZone) {
    this.loadInitialData();
  }

  get allShuttles() {
    return this._allShuttles;
  }

  public getShuttle(shuttleId: string): Observable<Shuttle> {
    return this._allShuttles.pipe(
      map((shuttles) => shuttles.find((s) => s.id === shuttleId))
    );
  }

  public getShuttlesByDistrict(districtId: string): Observable<Shuttle[]> {
    return this._allShuttles.pipe(
      map((shuttles) =>
        shuttles.filter(
          (shuttle: Shuttle) => shuttle.districtIds.indexOf(districtId) > -1
        )
      ),
      map((shuttles) => ShuttlesService.sortByRankingScore(shuttles))
    );
  }

  public filterShuttlesByPosition(
    shuttles: Shuttle[],
    coordinates: MyCoordinates,
    radius: number
  ): Shuttle[] {
    let ret: Shuttle[] = [];
    if (coordinates) {
      shuttles.map((shuttle: Shuttle) => {
        if (shuttle && shuttle.coordinates) {
          const distance = this.geoService.getDistance(
            coordinates,
            shuttle.coordinates
          );
          if (distance && distance < radius) {
            ret.push(shuttle);
          }
        }
      });
    }
    return ShuttlesService.sortByRankingScore(ret);
  }

  public mergeShuttles(
    shuttles: Shuttle[],
    favorites: Shuttle[],
    blacklist: Shuttle[]
  ): Shuttle[] {
    let ret: Shuttle[] = shuttles;
    let favoriteShuttlesInList: Shuttle[] = [];
    favorites.map((favorite) => {
      ret = ret.filter((shuttle) => {
        const found = favorite.id === shuttle.id;
        if (found) {
          favoriteShuttlesInList.push(shuttle);
        }
        return !found;
      });
    });
    ret = favoriteShuttlesInList.concat(ret);
    blacklist.map((blacklisted) => {
      ret = ret.filter((shuttle) => {
        return blacklisted.id !== shuttle.id;
      });
    });
    return ret;
  }

  private async loadInitialData() {
    let q = query(collection(this.db, 'shuttles'));
    const querySnapshot = await getDocs(q);
    console.info(
      `Fetched data from cache: ${querySnapshot.metadata.fromCache}`
    );

    const shuttles: Shuttle[] = [];
    querySnapshot.forEach((doc) => shuttles.push(doc.data() as Shuttle));
    this._allShuttles.next(shuttles);
  }
}
