import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Shuttle } from '@models/shuttle';
import { ListsService } from '@services/data/lists.service';
import { ElementType } from '@models/list-element';
import { ShuttlesService } from '@services/data/shuttles.service';
import { LocalDataService } from '@services/data/local-data.service';

@Component({
  selector: 'app-blacklist',
  templateUrl: './blacklist.page.html',
  styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit {
  constructor(
    private navCtrl: NavController,
    public localDataService: LocalDataService,
    public listsService: ListsService,
    public shuttlesService: ShuttlesService
  ) {}

  ngOnInit() {}

  public blockClicked() {
    this.navCtrl.navigateForward('settings/blacklist/add');
  }

  public shuttleClicked(shuttle: Shuttle) {
    this.navCtrl.navigateForward('settings/blacklist/shuttle/' + shuttle.id);
  }

  removeFromBlacklist(shuttle: Shuttle, event) {
    event.stopPropagation();
    event.preventDefault();
    this.localDataService.removeBlacklistedShuttle(shuttle);
    this.listsService.removeListElement(shuttle.id, ElementType.Blacklisted);
  }
}
