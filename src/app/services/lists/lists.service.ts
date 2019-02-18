import {Injectable} from '@angular/core';
import {UserDbService} from '../user-db/user-db.service';
import {BehaviorSubject, from} from 'rxjs';
import {List} from 'immutable';
import {ElementType, ListElement} from '../../models/new-models/list-element';

@Injectable({
    providedIn: 'root'
})
export class ListsService {
    private _favorites: BehaviorSubject<List<ListElement>>;
    private _blacklist: BehaviorSubject<List<ListElement>>;

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
        this.loadFavorites();
        this.loadBlacklist();

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
                err => console.log('Error retrieving Blacklist')
            );
    }

    public addListElement(listElement: ListElement) {
        const obs = this.userDbService.db.put(listElement);
        obs.subscribe(
            res => {
                switch (listElement.elementType) {
                    case ElementType.Favorite:
                        this._favorites.next(this._favorites.getValue().push(listElement));
                        break;
                    case ElementType.Blacklisted:
                        this._blacklist.next(this._blacklist.getValue().push(listElement));
                        break;
                }
            });
        return obs;
    }

    public deleteListElement(listElement: ListElement) {
        // let obs: Observable = this.userDbService.db.put(deleted);
        //
        // obs.subscribe(
        //     res => {
        //         let todos: List<Todo> = this._todos.getValue();
        //         let index = todos.findIndex((todo) => todo.id === deleted.id);
        //         this._todos.next(todos.delete(index));
        //
        //     }
        // );
        //
        // return obs;
    }

    public hideListElement(listElement: ListElement) {

    }
}
