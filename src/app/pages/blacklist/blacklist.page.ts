import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Shuttle } from '@models/shuttle';
import { ListsService } from '@services/data/lists.service';
import { ElementType } from '@models/list-element';
import { LocalDataService } from '@services/data/local-data.service';
import { trackShuttleById } from '../../utils/track-by-id.utils';
import { ListAction } from '@components/sf-shuttle-item/sf-shuttle-item.component';

@Component({
  selector: 'app-blacklist',
  templateUrl: './blacklist.page.html',
  styleUrls: ['./blacklist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlacklistPage {
  trackById = trackShuttleById;
  ListAction = ListAction;

  constructor(
    private navCtrl: NavController,
    public localDataService: LocalDataService,
    public listsService: ListsService
  ) {}

  async itemTapped(event: { shuttleId: string }) {
    await this.navCtrl.navigateForward(
      `settings/blacklist/shuttle/${event.shuttleId}`
    );
  }

  async removeFromBlacklistedTapped(event: {
    shuttle: Shuttle;
    action: ListAction;
  }) {
    console.log('Remove');
    await this.localDataService.removeBlacklistedShuttle(event.shuttle);
    await this.listsService.removeListElement(
      event.shuttle.id,
      ElementType.Blacklisted
    );
  }

  async blockClicked() {
    await this.navCtrl.navigateForward('settings/blacklist/add');
  }
}
