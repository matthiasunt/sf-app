import {Component, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
    selector: 'app-shuttle-popover',
    templateUrl: './shuttle-popover.page.html',
    styleUrls: ['./shuttle-popover.page.scss'],
})
export class ShuttlePopoverPage implements OnInit {

    constructor(private popoverController: PopoverController,
    ) {
    }

    ngOnInit() {
    }

    public closePopover() {
        this.popoverController.dismiss();
    }

}
