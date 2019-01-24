import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Shuttle} from '../../models/shuttle';
import {SfDbService} from '../../services/sf-db/sf-db.service';
import {ColorGeneratorService} from '../../services/color-generator/color-generator.service';

@Component({
    selector: 'app-shuttle',
    templateUrl: './shuttle.page.html',
    styleUrls: ['./shuttle.page.scss'],
})
export class ShuttlePage implements OnInit {

    shuttle: Shuttle;
    shuttleColors: any;

    constructor(private activatedRoute: ActivatedRoute,
                private router: Router,
                private sfDb: SfDbService,
                private colorGenerator: ColorGeneratorService,
    ) {

    }

    async ngOnInit() {
        this.shuttleColors = ['#99CC33', '#FFFFFF'];
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        this.shuttle = await this.sfDb.getShuttle(shuttleId);
        this.shuttleColors = this.colorGenerator.getShuttleColors(this.shuttle);
    }

    rateClicked(shuttle: Shuttle) {
        const currentUrl = this.router.url;
        this.router.navigate([currentUrl + '/rate/' + shuttle._id]);
    }

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColors[0],
            'color': this.colorGenerator.getContrastColor(this.shuttleColors[0])
        };
    }

}
