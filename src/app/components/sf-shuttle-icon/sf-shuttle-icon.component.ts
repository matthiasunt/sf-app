import {Component, Input, OnInit} from '@angular/core';
import {shadeHexColor} from '../../tools/sf-tools';

@Component({
    selector: 'app-sf-shuttle-icon',
    templateUrl: './sf-shuttle-icon.component.html',
    styleUrls: ['./sf-shuttle-icon.component.scss']
})
export class SfShuttleIconComponent implements OnInit {

    @Input()
    color: string;

    constructor() {
    }

    ngOnInit() {
    }

    getShadeColor() {
        return shadeHexColor(this.color, -0.05);
    }

}
