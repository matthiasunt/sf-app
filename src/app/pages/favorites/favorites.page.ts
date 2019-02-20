import {Component, OnInit} from '@angular/core';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';
import {NavController} from '@ionic/angular';
import {ListsService} from '../../services/lists/lists.service';
import {ShuttlesService} from '../../services/shuttles/shuttles.service';
import {ElementType} from '../../models/list-element';
import {List} from 'immutable';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit {

    constructor(private navCtrl: NavController,
                public shuttlesService: ShuttlesService,
                public listsService: ListsService,
                public colorGeneratorService: ColorGeneratorService
    ) {
    }

    async ngOnInit() {
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
