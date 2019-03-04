import {Injectable} from '@angular/core';
import {List, Map} from 'immutable';
import {Shuttle} from '@models/shuttle';
import {SfDbService} from '@services/data/sf-db/sf-db.service';
import {BehaviorSubject} from 'rxjs';
import {Rating} from '@models/rating';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {UserDbService} from '@services/data/user-db/user-db.service';

@Injectable({
    providedIn: 'root'
})
export class RatingService {

    private ratingsFromShuttles: Map<string, List<Rating>> = Map({});


    constructor(private sfDbService: SfDbService,
                private userDbService: UserDbService,
                private shuttlesService: ShuttlesService,
    ) {
    }

    public getRatingsFromShuttle(shuttleId: string): List<Rating> {
        return this.ratingsFromShuttles.get(shuttleId);
    }

    private async loadInitialData() {
        this.shuttlesService.allShuttles.subscribe((shuttles) => {
            shuttles.map(async (shuttle) => {
                try {
                    const res = await this.sfDbService.db.query('ratings/by_shuttle', {
                        include_docs: true, key: shuttle._id,
                    });
                    const ratings: List<Rating> = res.rows.map(row => {
                        return row.doc;
                    });
                    this.ratingsFromShuttles = this.ratingsFromShuttles.set(shuttle._id, ratings);
                } catch (err) {
                    console.error(err);
                }
            });
        });
    }
}
