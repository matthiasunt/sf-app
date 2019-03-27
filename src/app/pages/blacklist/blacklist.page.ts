import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ColorGeneratorService} from '@services/color-generator/color-generator.service';
import {Shuttle} from '@models/shuttle';
import {ListsService} from '@services/data/lists/lists.service';
import {ElementType} from '@models/list-element';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';

@Component({
    selector: 'app-blacklist',
    templateUrl: './blacklist.page.html',
    styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage {

    constructor(private navCtrl: NavController,
                public listsService: ListsService,
                public shuttlesService: ShuttlesService,
                public colorGeneratorService: ColorGeneratorService
    ) {
    }

    public blockClicked() {
        this.navCtrl.navigateForward('settings/blacklist/add');
    }

    public shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('settings/blacklist/shuttle/' + shuttle._id);
    }


    removeFromBlacklist(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        this.listsService.removeListElementByShuttleId(shuttle._id, ElementType.Blacklisted);
    }


}
