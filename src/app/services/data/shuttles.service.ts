import { inject, Injectable, NgZone } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';

import { GeoService } from '@services/geo.service';
import { MyCoordinates } from '@models/my-coordinates';
import { Shuttle } from '@models/shuttle';
import { map } from 'rxjs/operators';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { LocalDataService } from '@services/data/local-data.service';

@Injectable({
  providedIn: 'root',
})
export class ShuttlesService {
  shuttles$: Observable<Shuttle[]>;
  private firestore: Firestore = inject(Firestore);

  constructor(
    private geoService: GeoService,
    private localDataService: LocalDataService,
    public zone: NgZone
  ) {
    this.shuttles$ = collectionData(
      collection(this.firestore, 'shuttles')
    ) as Observable<Shuttle[]>;
  }

  public getShuttle(shuttleId: string): Observable<Shuttle> {
    return this.shuttles$.pipe(
      map((shuttles) => shuttles.find((s) => s.id === shuttleId))
    );
  }

  public getShuttlesByDistrict(districtId: string): Observable<Shuttle[]> {
    return this.shuttles$.pipe(
      map((shuttles) =>
        shuttles.filter(
          (shuttle: Shuttle) => shuttle.districtIds.indexOf(districtId) > -1
        )
      ),
      map((shuttles) => ShuttlesService.sortByRankingScore(shuttles))
    );
  }

  public getShuttles(districtId: string): Observable<Shuttle[]> {
    return combineLatest([
      this.getShuttlesByDistrict(districtId),
      this.localDataService.favoriteShuttles,
      this.localDataService.blacklistedShuttles,
    ]).pipe(
      map(([shuttles, favoriteShuttles, blacklistedShuttles]) => {
        return this.mergeShuttles(
          shuttles,
          favoriteShuttles,
          blacklistedShuttles
        );
      })
    );
  }

  public getShuttlesFromCoords(
    coordinates: MyCoordinates
  ): Observable<Shuttle[]> {
    return combineLatest([
      this.shuttles$,
      this.localDataService.favoriteShuttles,
      this.localDataService.blacklistedShuttles,
    ]).pipe(
      map(([allShuttles, favoriteShuttles, blacklistedShuttles]) => {
        let shuttles = this.filterShuttlesByPosition(
          allShuttles,
          coordinates,
          22000
        );
        if (shuttles.length < 3) {
          shuttles = this.filterShuttlesByPosition(
            allShuttles,
            coordinates,
            27000
          );
        }
        return this.mergeShuttles(
          shuttles,
          favoriteShuttles,
          blacklistedShuttles
        );
      })
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

  private static sortByRankingScore(shuttles: Shuttle[]): Shuttle[] {
    return shuttles.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  private mergeShuttles(
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
}
