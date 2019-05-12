import {Component, OnInit, OnDestroy} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {NavController} from '@ionic/angular';
import {ListsService} from '@services/data/lists/lists.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ElementType} from '@models/list-element';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage {

    public favoriteShuttles: Shuttle[];

    constructor(private navCtrl: NavController,
                public shuttlesService: ShuttlesService,
                public listsService: ListsService,
    ) {
        this.favoriteShuttles = [];
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
