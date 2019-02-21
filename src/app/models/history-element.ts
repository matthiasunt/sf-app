import {Shuttle} from './shuttle';
import {Call} from './call';

export interface HistoryElement {
    shuttle: Shuttle;
    call: Call;
    date: Date;
}
