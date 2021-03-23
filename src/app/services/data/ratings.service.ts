import {Injectable} from '@angular/core';
import {List} from 'immutable';
import {SfDbService} from '@services/data/sf-db.service';
import {Rating} from '@models/rating';
import {UserDbService} from '@services/data/user-db.service';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RatingsService {

    private _userRatings: BehaviorSubject<List<Rating>> = new BehaviorSubject(List([]));
    private _ratings: BehaviorSubject<List<Rating>> = new BehaviorSubject(List([]));

    constructor(private sfDbService: SfDbService,
                private userDbService: UserDbService,
    ) {
        this.loadInitialData();
    }


    get userRatings(): Observable<List<Rating>> {
        return this._userRatings;
    }

    get ratings(): Observable<List<Rating>> {
        return this._ratings;
    }

    public getShuttleRatings(shuttleId: string): Observable<List<Rating>> {
        return this._ratings.pipe(
            map(ratings => ratings.filter(r => r.shuttleId === shuttleId)));

    }


    public putRating(rating: Rating) {
        const res$ = this.userDbService.putDoc(rating);
        res$.subscribe((res) => {
            console.log(res);
            this._userRatings.next(this._userRatings.getValue().push(rating));
        });
    }

    public updateRating(rating: Rating) {
        const res$ = this.userDbService.updateDoc(rating);
        const currentRatings = this._userRatings.getValue();
        res$.subscribe((res) => {
            const updatedRatings = currentRatings.set(
                currentRatings.findIndex(r => r._id === rating._id),
                rating);
            this._userRatings.next(updatedRatings);
        });
    }

    public deleteRating(rating: Rating) {
        rating._deleted = true;
        const res$ = this.userDbService.updateDoc(rating);
        const currentRatings = this._userRatings.getValue();
        res$.subscribe((res) => {
            const updatedRatings = currentRatings.delete(
                currentRatings.findIndex(r => r._id === rating._id));
            this._userRatings.next(updatedRatings);
        });
    }

    private loadInitialData() {
        this.loadInitialUserRatings();
        this.loadInitialRatings();
    }

    private loadInitialUserRatings() {
        this.userDbService.syncSubject.subscribe(() => {
            from(this.userDbService.db.query('ratings/all', {
                include_docs: true
            })).subscribe((res: any) => {
                this._userRatings.next(List(res.rows.map(row => row.doc)));
            });
        });
    }

    private loadInitialRatings() {
        this.sfDbService.syncSubject.subscribe(() => {
            from(this.sfDbService.db.query('ratings/all', {
                include_docs: true
            })).subscribe((res: any) => {
                this._ratings.next(List(res.rows.map(row => row.doc)));
            });
        });
    }


}
