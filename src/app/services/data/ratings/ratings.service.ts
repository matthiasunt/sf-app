import {Injectable} from '@angular/core';
import {List, Map} from 'immutable';
import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {Rating} from '@models/rating';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {UserDbService} from '@services/data/user-db/user-db.service';
import {Shuttle} from '@models/shuttle';
import {BehaviorSubject, from, Observable, pipe} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RatingsService {

    private _userRatings: BehaviorSubject<List<Rating>> = new BehaviorSubject(List());

    constructor(private sfDbService: SfDbService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
    ) {
        this.loadInitialData();
    }


    get userRatings(): Observable<List<Rating>> {
        return this._userRatings;
    }


    // Add to initial Data? Currently fetching always from db
    public getShuttleRatings(shuttleId: string): Observable<List<Rating>> {
        return from(this.sfDbService.db.query('ratings/by_shuttle', {
            include_docs: true, key: shuttleId,
        })).pipe(map((res: any) => {
            return List(res.rows.map(row => row.doc));
        }));
    }

    public putRating(rating: Rating) {
        const res$ = this.userDbService.putDoc(rating);
        res$.subscribe((res) => {
            this._userRatings.next(this._userRatings.getValue().push(rating));
        });
    }

    public updateRating(rating: Rating) {
        const res$ = this.userDbService.updateDoc(rating);
        const ratings = this._userRatings.getValue();

        res$.subscribe((res) => {
            const userRatings = ratings
                .set(
                    ratings.findIndex((userRating: Rating) => userRating._id === rating._id),
                    rating);
            this._userRatings.next(userRatings);
        });
    }

    public deleteRating(rating: Rating) {
        rating._deleted = true;
        return this.updateRating(rating);
    }

    private async loadInitialData() {
        this.loadInitialUserRatings();
    }

    private loadInitialUserRatings() {
        from(this.userDbService.db.query('ratings/all', {
            include_docs: true
        })).pipe(map((res: any) => {
            const userRatings: List<Rating> = List(res.rows.map(row => row.doc));
            console.log(userRatings.toArray());
            this._userRatings.next(userRatings);
        }));
    }

    // TODO
    private loadInitialShuttleRatings() {

    }
}
