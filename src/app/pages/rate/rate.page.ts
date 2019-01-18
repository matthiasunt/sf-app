import {Component, OnInit} from '@angular/core';
import {Shuttle} from '../../models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';
import {NgForm} from '@angular/forms';

@Component({
    selector: 'app-rate',
    templateUrl: './rate.page.html',
    styleUrls: ['./rate.page.scss'],
})
export class RatePage implements OnInit {


    shuttle: Shuttle;
    shuttleColors: string[];

    rating = {
        service: 0,
        drivingStyle: 0,
        price: 0,
        review: ''
    };

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private sfDb: SfDbService,
                private colorGenerator: ColorGeneratorService) {
    }

    async ngOnInit() {
        this.shuttleColors = ['#99CC33', '#FFFFFF'];
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.sfDb.getShuttle(shuttleId);
        this.shuttleColors = this.colorGenerator.getShuttleColors(this.shuttle);
    }

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColors[0],
            'color': this.colorGenerator.getContrastColor(this.shuttleColors[0])
        };
    }

    onSubmit(f: NgForm) {
        console.log(f.value);
        this.router.navigate(['tabs/history']);
    }

}
