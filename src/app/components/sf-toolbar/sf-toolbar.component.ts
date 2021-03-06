import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-sf-toolbar',
    templateUrl: './sf-toolbar.component.html',
    styleUrls: ['./sf-toolbar.component.scss']
})
export class SfToolbarComponent implements OnInit {

    constructor(private router: Router,
    ) {
    }

    ngOnInit() {
    }

    toSettings() {
        const currentUrl = this.router.url;
        this.router.navigate(['/settings']);
        // this.router.navigate([currentUrl + '/settings']);
    }

}
