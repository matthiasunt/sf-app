import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DeviceService} from '../../services/device/device.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

    public appVersionNumber: string;

    constructor(private translate: TranslateService,
                private deviceService: DeviceService,
    ) {
    }

    async ngOnInit() {
        this.appVersionNumber = 'x.x';
        this.appVersionNumber = await this.deviceService.getAppVersion();
    }

    public getMailToLinkWithSubject(): string {
        return 'mailto:missing@shuttlefinder.it?subject=' + this.translate.instant('about.MISSING_MAIL_SUBJECT');
    }

}
