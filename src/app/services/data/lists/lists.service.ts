import {Injectable} from '@angular/core';
import {UserDbService} from '../user-db/user-db.service';
import {BehaviorSubject, from} from 'rxjs';
import {List} from 'immutable';
import {ElementType, ListElement} from '../../../models/list-element';

@Injectable({
    providedIn: 'root'
})
export class ListsService {
    private _favorites: BehaviorSubject<List<ListElement>> = new BehaviorSubject(List([]));
    private _blacklist: BehaviorSubject<List<ListElement>> = new BehaviorSubject(List([]));


    constructor(private userDbService: UserDbService) {
        this.loadInitialData();
    }

    get favorites() {
        return this._favorites;
    }

    get blacklist() {
        return this._blacklist;
    }

    private loadInitialData() {
        this.userDbService.syncSubject.subscribe(() => {
            this.loadFavorites();
            this.loadBlacklist();
        });
    }

    private loadFavorites() {
        this.loadListData(ElementType.Favorite);
    }

    private loadBlacklist() {
        this.loadListData(ElementType.Blacklisted);
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
        try {
            const res = await this.userDbService.db.put(listElement);
            console.log(res);
            if (listElement.type === ElementType.Favorite) {
                this._favorites.next(this._favorites.getValue().push(listElement));
            } else {
                this._blacklist.next(this._blacklist.getValue().push(listElement));
            }
        } catch (err) {
            console.error(err);
        }
    }

    public async removeListElementByShuttleId(shuttleId: string, type: ElementType) {
        const list = type === ElementType.Favorite ? this._favorites.getValue() : this._blacklist.getValue();
        const listElement = list.find((element) => element.shuttleId === shuttleId);
        try {
            const res = await this.userDbService.removeDoc(listElement);
            console.log(res);
            const index = list.findIndex((element) => element.shuttleId === shuttleId);
            if (type === ElementType.Favorite) {
                this._favorites.next(this._favorites.getValue().delete(index));
            } else {
                this._blacklist.next(this._blacklist.getValue().delete(index));
            }
        } catch (err) {
            console.error(err);
        }
    }

    public hideListElement(listElement: ListElement) {

    }
}
