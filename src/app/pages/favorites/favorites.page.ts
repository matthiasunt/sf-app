import {Component, OnInit, OnDestroy} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {NavController} from '@ionic/angular';
import {ListsService} from '@services/data/lists/lists.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ElementType} from '@models/list-element';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit {

    public favoriteShuttles$: Observable<Shuttle[]>;

    constructor(private navCtrl: NavController,
                public shuttlesService: ShuttlesService,
                public listsService: ListsService,
    ) {

    }

    ngOnInit() {
        this.favoriteShuttles$ = combineLatest([this.shuttlesService.allShuttles, this.listsService.favorites])
            .pipe(
                map(([allShuttles, favorites]) =>
                    favorites.map(f =>
                        allShuttles.find(s => s._id === f.shuttleId)).toArray())
            );
    }

    public shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('tabs/favorites/shuttle/' + shuttle._id);
    }

    public addClicked() {
        this.navCtrl.navigateForward('tabs/favorites/add');
    }

    private async removeFavorite(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        this.listsService.removeListElementByShuttleId(shuttle._id, ElementType.Favorite);
    }
}
