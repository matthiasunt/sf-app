import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Route, Router} from '@angular/router';
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

    private getToolbarStyle() {
        return {
            'background-color': this.shuttleColors[0],
            'color': this.getContrastColor(this.shuttleColors[0])
        };
    }

    private getContrastColor(hexcolor: string): string {
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 160) ? 'black' : 'white';
    }

}
