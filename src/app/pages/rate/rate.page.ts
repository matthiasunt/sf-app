import {Component, OnInit} from '@angular/core';
import {Shuttle} from '../../models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';
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
        reliability: 0,
        price: 0,
        ownMusic: false,
        review: ''
    };

    constructor(private navCtrl: NavController,
                private activatedRoute: ActivatedRoute,
                private shuttlesService: ShuttlesService,
                private colorGenerator: ColorGeneratorService) {
    }

    ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
        this.shuttleColor = this.colorGenerator.getShuttleColor(this.shuttle);
    }

    getToolbarStyle() {
        return {
            'background-color': this.shuttleColor,
            'color': getContrastColor(this.shuttleColor)
        };
    }

    onSubmit(f: NgForm) {
        console.log(this.rating);
        this.navCtrl.navigateBack('tabs/history');
    }

}
