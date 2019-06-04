import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Shuttle} from '@models/shuttle';
import {ListsService} from '@services/data/lists/lists.service';
import {ElementType} from '@models/list-element';
import {ShuttlesService} from '@services/data/shuttles/shuttles.service';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-blacklist',
    templateUrl: './blacklist.page.html',
    styleUrls: ['./blacklist.page.scss'],
})
export class BlacklistPage implements OnInit{

    public blacklistedShuttles$: Observable<Shuttle[]>;

    constructor(private navCtrl: NavController,
                public listsService: ListsService,
                public shuttlesService: ShuttlesService,
    ) {
    }

    ngOnInit(): void {
        this.blacklistedShuttles$ = combineLatest(this.shuttlesService.allShuttles, this.listsService.blacklist)
            .pipe(
                map(([allShuttles, favorites]) =>
                    favorites.map(f =>
                        allShuttles.find(s => s._id === f.shuttleId)).toArray())
            );
    }

    public blockClicked() {
        this.navCtrl.navigateForward('settings/blacklist/add');
    }

    public shuttleClicked(shuttle: Shuttle) {
        this.navCtrl.navigateForward('settings/blacklist/shuttle/' + shuttle._id);
    }


    removeFromBlacklist(shuttle: Shuttle, event) {
        event.stopPropagation();
        event.preventDefault();
        this.listsService.removeListElementByShuttleId(shuttle._id, ElementType.Blacklisted);
    }




}
