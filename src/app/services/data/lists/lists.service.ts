import {Injectable} from '@angular/core';
import {UserDbService} from '@services/data/user-db/user-db.service';
import {ElementType, ListElement} from '@models/list-element';
import {LocalDataService} from '@services/data/local-data/local-data.service';

@Injectable({
    providedIn: 'root'
})

export class ListsService {

    constructor(
        private localDataService: LocalDataService,
        private userDbService: UserDbService
    ) {
    }

    public async addListElement(listElement: ListElement) {
        const res$ = this.userDbService.putDoc(listElement);
        res$.subscribe(res => console.log(res));
    }

    public async removeListElementByShuttleId(shuttleId: string, type: ElementType) {
        const userId = this.userDbService.getUserId();
        if (userId && userId.length > 0) {
            this.userDbService.getDoc(`${this.userDbService.getUserId()}--${type}--${shuttleId}`).subscribe((getRes) => {
                const delRes$ = this.userDbService.removeDoc(getRes);
                delRes$.subscribe(delRes => console.log(delRes));
            });
        } else {
            console.log('UserId not defined');
        }

    }
}
