import {Component, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
    selectedLang: string;
    directMode: boolean;
    shareData: boolean;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private popoverCtrl: PopoverController,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
    ) {
    }

    async ngOnInit() {
        this.shareData = true;
        this.selectedLang = this.translate.currentLang;
        this.directMode = await this.localData.getDirectMode();
    }

    modeChanged(event) {
        this.localData.setDirectMode(this.directMode);
    }

    languageChange(event) {
        this.translate.use(this.selectedLang);
        this.localData.setLang(this.selectedLang);
    }

}
