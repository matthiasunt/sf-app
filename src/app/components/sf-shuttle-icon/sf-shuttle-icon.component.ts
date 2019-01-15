import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-sf-shuttle-icon',
    templateUrl: './sf-shuttle-icon.component.html',
    styleUrls: ['./sf-shuttle-icon.component.scss']
})
export class SfShuttleIconComponent implements OnInit {

    @Input()
    colors: string[] = ['#FFDC5A', '#FFC84B'];

    constructor() {
    }

    ngOnInit() {
    }

}
