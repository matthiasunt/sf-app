import {Component} from '@angular/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage {

    private favorites: any[];
    private blacklist: any[];
    private reorder: boolean;
    private showRemoveIcon: boolean;

    constructor(private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService
    ) {
        this.reorder = false;
        this.showRemoveIcon = true;
        this.favorites = localData.getFavorites();
    }

    private toggleReorder() {
        this.reorder ? this.reorder = false : this.reorder = true;
        if (this.reorder) {
            this.showRemoveIcon = false;
        } else {
            setTimeout(() => {
                this.showRemoveIcon = true;
            }, 415);
        }
    }

    private reorderItems(indexes) {
        // this.favorites = reorderArray(this.favorites, indexes);
        this.localData.setFavorites(this.favorites);
    }

    private removeFavorite(element: any) {
        this.localData.removeShuttleFromFavorites(element);
    }

    private toAddPage() {
        //   this.navCtrl.push("Add",
        //       {
        //         list: this.favorites,
        //         addToFavorites: true
        //       }
        //   );
    }
}
