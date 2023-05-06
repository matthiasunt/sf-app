import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shuttle } from '@models/shuttle';
import { NavController } from '@ionic/angular';
import { ListsService } from '@services/data/lists.service';
import { ElementType } from '@models/list-element';
import { LocalDataService } from '@services/data/local-data.service';
import { trackShuttleById } from '../../utils/track-by-id.utils';
import { ListAction } from '@components/sf-shuttle-item/sf-shuttle-item.component';

@Component({
  selector: 'app-favorites',
  templateUrl: 'favorites.page.html',
  styleUrls: ['favorites.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage {
  trackById = trackShuttleById;
  ListAction = ListAction;

  constructor(
    private navCtrl: NavController,
    public listsService: ListsService,
    public localDataService: LocalDataService
  ) {}

  async itemTapped(event: { shuttleId: string }) {
    await this.navCtrl.navigateForward(
      `tabs/favorites/shuttle/${event.shuttleId}`
    );
  }

  async removeFavoriteTapped(event: { shuttle: Shuttle; action: ListAction }) {
    await this.localDataService.removeFavoriteShuttle(event.shuttle);
    await this.listsService.removeListElement(
      event.shuttle.id,
      ElementType.Favorites
    );
  }

  async addClicked() {
    await this.navCtrl.navigateForward('tabs/favorites/add');
  }
}
