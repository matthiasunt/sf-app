import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';

import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {Shuttle} from '../../models/shuttle';

@Component({
    selector: 'app-blacklist',
    templateUrl: './blacklist.page.html',
    styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit {

    blacklist: Shuttle[];

    constructor(private navCtrl: NavController,
                private sfDb: SfDbService,
                private localData: LocalDataService,
                public colorGeneratorService: ColorGeneratorService
    ) {
    }

    async ngOnInit() {
        this.blacklist = await this.localData.getBlacklist();
    }

    blockClicked() {
        this.navCtrl.navigateForward('settings/blacklist/add');
    }

    private shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('settings/blacklist/shuttle/' + shuttle._id);
    }


    removeFromBlacklist(element: any, event) {
        event.stopPropagation();
        event.preventDefault();
        this.localData.removeBlacklisted(element);
    }


}
