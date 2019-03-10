import {Injectable} from '@angular/core';
import {List, Map} from 'immutable';
import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {Rating} from '@models/rating';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {UserDbService} from '@services/data/user-db/user-db.service';
import {Shuttle} from '@models/shuttle';

@Injectable({
    providedIn: 'root'
})
export class RatingsService {

    private ratingsByShuttles: Map<string, List<Rating>> = Map({});
    private ratingsFromUser: Map<string, Rating> = Map({});

    constructor(private sfDbService: SfDbService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
    ) {
        this.loadInitialData();
    }

    public getRatingsFromShuttle(shuttleId: string): List<Rating> {
        const ret = this.ratingsByShuttles.get(shuttleId);
        return ret ? ret : List([]);
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

    private async loadInitialData() {
        this.shuttlesService.allShuttles.subscribe((shuttles) => {
            shuttles.map(async (shuttle: Shuttle) => {
                try {
                    const res = await this.sfDbService.db.query('ratings/by_shuttle', {
                        include_docs: true, key: shuttle._id,
                    });
                    const ratings: List<Rating> = res.rows.map(row => {
                        return row.doc;
                    });
                    this.ratingsByShuttles = this.ratingsByShuttles.set(shuttle._id, ratings);
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
