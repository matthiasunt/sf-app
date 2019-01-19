import {Component, OnInit} from '@angular/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';

@Component({
    selector: 'app-blacklist',
    templateUrl: './blacklist.page.html',
    styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit {

    blacklist: any[];

    constructor(private sfDb: SfDbService,
                private localData: LocalDataService,
                private colorGeneratorService: ColorGeneratorService
    ) {
        this.blacklist = localData.getBlacklist();
        console.log(this.blacklist);
    }

    ngOnInit() {
    }


    removeFromBlacklist(element: any) {
        this.localData.removeShuttleFromBlacklist(element);
    }


}
