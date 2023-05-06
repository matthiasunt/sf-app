import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage implements OnInit {
  public appVersionNumber: string;

  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      this.appVersionNumber = (await App.getInfo()).version;
    }
  }

  public getMailToLinkWithSubject(): string {
    return (
      'mailto:missing@shuttlefinder.app?subject=' +
      this.translate.instant('about.MISSING_MAIL_SUBJECT')
    );
  }
}
