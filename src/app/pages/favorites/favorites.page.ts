import {Component, OnInit, OnDestroy} from '@angular/core';
import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {Shuttle} from '@models/shuttle';
import {NavController} from '@ionic/angular';
import {ListsService} from '@services/data/lists/lists.service';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {ElementType} from '@models/list-element';
import {List} from 'immutable';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'app-favorites',
    templateUrl: 'favorites.page.html',
    styleUrls: ['favorites.page.scss']
})
export class FavoritesPage implements OnInit {
    private unsubscribe$ = new Subject<void>();
    public favoriteShuttles: Shuttle[];

    constructor(private navCtrl: NavController,
                public shuttlesService: ShuttlesService,
                public listsService: ListsService,
                public colorGeneratorService: ColorGeneratorService
    ) {
        this.favoriteShuttles = [];
    }

    ngOnInit() {
        this.listsService.favorites
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((favorites) => {
            this.favoriteShuttles = this.shuttlesService.getShuttlesFromList(favorites).toArray();
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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
