import {Component, OnInit} from '@angular/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';
import {Router} from '@angular/router';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit {

    favorites: Shuttle[];

    constructor(private navCtrl: NavController,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService
    ) {
        this.favorites = [];
    }

    async ngOnInit() {
        this.favorites = await this.localData.getFavorites();
    }

    shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('tabs/favorites/shuttle/' + shuttle._id);
    }

    addClicked() {
        this.navCtrl.navigateForward('tabs/favorites/add');
    }

    private async removeFavorite(element: any, event) {
        event.stopPropagation();
        event.preventDefault();
        // this.favorites.splice(this.favorites.findIndex(e => e._id === element._id), 1);
        await this.localData.removeFavorite(element);
        console.log(this.favorites);
    }
}
