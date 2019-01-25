import {Component, OnInit} from '@angular/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit {

    favorites: Shuttle[];

    constructor(private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService
    ) {
        this.favorites = [];
    }

    async ngOnInit() {
        this.favorites = await this.localData.getFavorites();
    }

    private removeFavorite(element: any) {
        this.localData.removeFavorite(element);
        console.log(this.favorites);
    }
}
