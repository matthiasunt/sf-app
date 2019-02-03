import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {CallNumber} from '@ionic-native/call-number/ngx';
import {LocalDataService} from '../../services/local-data/local-data.service';
import {NavController} from '@ionic/angular';
import {ShuttlesService} from '../../services/shuttles/shuttles.service';

@Component({
    selector: 'app-shuttle',
    templateUrl: './shuttle.page.html',
    styleUrls: ['./shuttle.page.scss'],
    providers: [CallNumber],
})
export class ShuttlePage implements OnInit {

    shuttle: Shuttle;
    shuttleColors: any;

    constructor(private navCtrl: NavController,
                private callNumber: CallNumber,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private localData: LocalDataService,
                private shuttlesService: ShuttlesService,
                private colorGenerator: ColorGeneratorService,
    ) {

    }

    async ngOnInit() {
        this.shuttleColors = ['#99CC33', '#FFFFFF'];
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttlesService.getShuttle(shuttleId).subscribe((shuttle: Shuttle) => {
            this.shuttle = shuttle;
            this.shuttleColors = this.colorGenerator.getShuttleColors(shuttle);
        });

    }

    callClicked(shuttle: Shuttle) {
        this.localData.addShuttleToHistory(shuttle);
        this.callNumber.callNumber(shuttle.phone, true);
    }

    rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.navCtrl.navigateForward(currentUrl + '/rate/' + shuttle._id);
    }

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColors[0],
            'color': this.colorGenerator.getContrastColor(this.shuttleColors[0])
        };
    }

    private getPhoneNumber(shuttle: Shuttle) {
        if (shuttle) {
            return this.shuttlesService.getFormattedPhoneNumber(shuttle.phone);
        }
    }

}
