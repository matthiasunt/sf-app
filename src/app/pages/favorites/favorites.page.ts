import {Component, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {NavController} from '@ionic/angular';
import {ListsService} from '@services/data/lists.service';
import {ShuttlesService} from '@services/data/shuttles.service';
import {ElementType} from '@models/list-element';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LocalDataService} from '@services/data/local-data.service';

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
                public localDataService: LocalDataService
    ) {

    }

    ngOnInit() {
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
        this.localDataService.removeFavoriteShuttle(shuttle);
        this.listsService.removeListElementByShuttleId(shuttle._id, ElementType.Favorite);
    }
}
