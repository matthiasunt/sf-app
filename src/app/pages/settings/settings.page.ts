import {Component, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
    private selectedLang: string;
    private directMode: boolean;
    private shareData: boolean;

    constructor(private activatedRoute: ActivatedRoute,
                private popoverCtrl: PopoverController,
                private translate: TranslateService,
                private sfDb: SfDbService,
                private localData: LocalDataService,
    ) {

        this.shareData = true;
        this.selectedLang = translate.currentLang;

        this.directMode = localData.inDirectMode();

    }

    ngOnInit() {
    }


    private shareDataChanged() {

    }

    private languageChange(lang: string) {
        this.translate.use(lang);
        this.localData.setPrefLang(lang);
    }

    private toPage(page: string) {
        // this.navCtrl.push(page);
    }

    private toFavouritesPage() {
        // this.navCtrl.push("Favorites");
    }

    private toBlacklistPage() {
        // this.navCtrl.push("Blacklist");
    }

    private toAboutPage() {
        // this.navCtrl.push("About");
    }

    private modeChanged() {
        // this.localData.setDirectMode(this.directMode);
    }

}
