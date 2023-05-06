import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataService } from '@services/data/local-data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnInit {
  selectedLang: string;
  shareData: boolean;

  constructor(
    private translate: TranslateService,
    private localData: LocalDataService
  ) {}

  async ngOnInit() {
    this.shareData = true;
    this.selectedLang = this.translate.currentLang;
  }

  languageChange(event) {
    this.translate.use(this.selectedLang);
    this.localData.setLang(this.selectedLang);
  }
}
