import {Component, OnInit} from '@angular/core';
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

    constructor(private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService
    ) {
    }

    async ngOnInit() {
        this.blacklist = await this.localData.getBlacklist();
    }


    removeFromBlacklist(element: any) {
        this.localData.removeBlacklisted(element);
    }


}
