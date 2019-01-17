import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

    appVersionNumber: any;

    constructor(private translate: TranslateService,
    ) {
    }

    async ngOnInit() {
        this.appVersionNumber = 'x.x';
        // this.appVersionNumber = await this.appVersion.getVersionNumber();
    }

    private getMailToLinkWithSubject() {
        return 'mailto:missing@shuttlefinder.it?subject=' + this.translate.instant('about.MISSING_MAIL_SUBJECT');
    }

}
