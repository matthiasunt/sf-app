import {Component, OnInit} from '@angular/core';
import {Shuttle} from '@models/shuttle';
import {ActivatedRoute, Router} from '@angular/router';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';

@Component({
    selector: 'app-ratings',
    templateUrl: './ratings.page.html',
    styleUrls: ['./ratings.page.scss'],
})
export class RatingsPage implements OnInit {

    shuttle: Shuttle;

    constructor(private activatedRoute: ActivatedRoute,
                private router: Router,
                private shuttlesService: ShuttlesService,
    ) {
    }

    ngOnInit() {
        const shuttleId = this.activatedRoute.snapshot.paramMap.get('id');
        console.log(this.router.url);
        this.shuttle = this.shuttlesService.getShuttle(shuttleId);
    }

}
