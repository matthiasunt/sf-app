import {Injectable} from '@angular/core';
import {UserDbService} from '../user-db/user-db.service';
import {BehaviorSubject, from} from 'rxjs';
import {List} from 'immutable';
import {ElementType, ListElement} from '@models/list-element';
import {LocalDataService} from '@services/data/local-data/local-data.service';

@Injectable({
    providedIn: 'root'
})

// TODO: Refactor
export class ListsService {
    private _favorites: BehaviorSubject<List<ListElement>> = new BehaviorSubject(List([]));
    private _blacklist: BehaviorSubject<List<ListElement>> = new BehaviorSubject(List([]));


    constructor(
        private localDataService: LocalDataService,
        private userDbService: UserDbService
    ) {
        this.loadInitialData();
    }

    private loadInitialData() {
        this.userDbService.syncSubject.subscribe(() => {
            this.loadListData(ElementType.Favorite);
            this.loadListData(ElementType.Blacklisted);
        });
    }

    private loadListData(type: ElementType) {
        const designDoc = type === ElementType.Favorite ?
            'favorites/all' : 'blacklist/all';
        from(this.userDbService.db.query(designDoc, {include_docs: true}))
            .subscribe(
                (res: any) => {
                    let list: List<ListElement> = List();
                    res.rows.map(row => {
                        list = list.push(row.doc);
                    });
                    switch (type) {
                        case ElementType.Favorite:
                            this._favorites.next(list);
                            break;
                        case ElementType.Blacklisted:
                            this._blacklist.next(list);
                    }
                },
                (err) => {
                    console.error(err);
                }
            );
    }

    public async addListElement(listElement: ListElement) {
        const res$ = this.userDbService.putDoc(listElement);
        res$.subscribe((res) => {
            if (listElement.type === ElementType.Favorite) {
                this._favorites.next(this._favorites.getValue().push(listElement));
            } else {
                this._blacklist.next(this._blacklist.getValue().push(listElement));
            }
        });
    }

    public async removeListElementByShuttleId(shuttleId: string, type: ElementType) {
        const list = type === ElementType.Favorite ? this._favorites.getValue() : this._blacklist.getValue();
        const listElement = list.find((element) => element.shuttleId === shuttleId);
        const res$ = this.userDbService.removeDoc(listElement);
        res$.subscribe((res) => {
            console.log(res);
            const index = list.findIndex((element) => element.shuttleId === shuttleId);
            if (type === ElementType.Favorite) {
                this._favorites.next(this._favorites.getValue().delete(index));
            } else {
                this._blacklist.next(this._blacklist.getValue().delete(index));
            }
        });
    }
}
