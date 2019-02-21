import {Component, OnInit} from '@angular/core';
import {Shuttle} from '../../models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';
import {SfDbService} from '../../services/data/sf-db/sf-db.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {NgForm} from '@angular/forms';
import {NavController} from '@ionic/angular';
import {ShuttlesService} from '../../services/data/shuttles/shuttles.service';
import {getContrastColor} from '../../tools/sf-tools';

@Component({
    selector: 'app-rate',
    templateUrl: './rate.page.html',
    styleUrls: ['./rate.page.scss'],
})
export class RatePage implements OnInit {


    shuttle: Shuttle;
    shuttleColor: string;

    rating = {
        service: 0,
        drivingStyle: 0,
        price: 0,
        ownMusic: false,
        review: ''
    };

    constructor(private navCtrl: NavController,
                private activatedRoute: ActivatedRoute,
                private shuttlesService: ShuttlesService,
                private colorGenerator: ColorGeneratorService) {
    }

    async ngOnInit() {
        this.shuttleColor = '#99CC33';
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
    }

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColor[0],
            'color': getContrastColor(this.shuttleColor[0])
        };
    }

    onSubmit(f: NgForm) {
        this.navCtrl.navigateBack('tabs/history');
    }

}
