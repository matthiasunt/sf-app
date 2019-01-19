import {Component, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {ActivatedRoute, Router, RoutesRecognized} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
    private selectedLang: string;
    private directMode: boolean;
    private shareData: boolean;
    private prevUrl: string;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
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

    private languageChange(event) {
        this.translate.use(this.selectedLang);
        this.localData.setPrefLang(this.selectedLang);
    }

    private modeChanged() {
        // this.localData.setDirectMode(this.directMode);
    }

}
