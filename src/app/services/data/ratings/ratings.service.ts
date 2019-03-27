import {Injectable} from '@angular/core';
import {List, Map} from 'immutable';
import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {Rating} from '@models/rating';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {UserDbService} from '@services/data/user-db/user-db.service';
import {Shuttle} from '@models/shuttle';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RatingsService {

    private _ratingsByShuttles: BehaviorSubject<Map<string, List<Rating>>> = new BehaviorSubject(Map({}));
    private ratingsFromUser: Map<string, Rating> = Map({});

    constructor(private sfDbService: SfDbService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
    ) {
        this.loadInitialData();
    }

    get ratingsByShuttles() {
        return this._ratingsByShuttles;
    }

    public getRatingByUserForShuttle(shuttleId: string): Rating {
        return this.ratingsFromUser.get(shuttleId);
    }

    public async putRating(rating: Rating) {
        try {
            const res = await this.userDbService.putDoc(rating);
            console.log(res);
            this.ratingsFromUser = this.ratingsFromUser.set(rating.shuttleId, rating);
        } catch (err) {
            console.error(err);
        }
    }

    public async updateRating(rating: Rating) {
        try {
            const res = await this.userDbService.updateDoc(rating);
            console.log(res);
            this.ratingsFromUser = this.ratingsFromUser.set(rating.shuttleId, rating);
        } catch (err) {
            console.error(err);
        }
    }

    public async deleteRating(rating: Rating) {
        try {
            const res = await this.userDbService.removeDoc(rating);
            console.log(res);
            this.ratingsFromUser = this.ratingsFromUser.remove(rating.shuttleId);
        } catch (err) {
            console.error(err);
        }
    }

    private async loadInitialData() {
        this.shuttlesService.allShuttles.subscribe((shuttles) => {
            let ratingsByShuttles: Map<string, List<Rating>> = Map({});
            shuttles.map(async (shuttle: Shuttle) => {
                try {
                    const res = await this.sfDbService.db.query('ratings/by_shuttle', {
                        include_docs: true, key: shuttle._id,
                    });
                    const ratings: Rating[] = res.rows.map(row => {
                        return row.doc;
                    });
                    ratingsByShuttles = ratingsByShuttles.set(shuttle._id, List(ratings));
                    this._ratingsByShuttles.next(ratingsByShuttles);
                } catch (err) {
                    console.error(err);
                }
            });

        });
        try {
            const res = await this.userDbService.db.query('ratings/all', {
                include_docs: true
            });
            res.rows.map(row => {
                const rating: Rating = row.doc;
                this.ratingsFromUser = this.ratingsFromUser.set(rating.shuttleId, rating);
            });
        } catch (err) {
            console.error(err);
        }
    }
}
