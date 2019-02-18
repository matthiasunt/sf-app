import {Shuttle} from '../models/shuttle';

export function getFormattedPhoneNumber(phone: string): string {
    let ret = '';
    if (phone && phone.length > -1) {
        if (phone.charAt(3) === '0') {
            ret += phone.substring(3, 7) + ' ' + phone.substring(7, 13);
        } else {
            ret += phone.substring(3, 6) + ' ' + phone.substring(6);
        }
    }
    return ret;
}

export function getBeautifulTimeString(dateString: string, locale: string): string {
    return new Date(dateString).toLocaleString(locale,
        {
            hour: 'numeric',
            minute: 'numeric'
        });
}

export function getBeautifulDateString(dateString: string, locale: string): string {
    const ret = new Date(dateString).toLocaleString(locale,
        {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    return ret.charAt(0).toUpperCase() + ret.slice(1);
}

export function getIndexOfShuttle(arr: any[], shuttle: Shuttle): number {
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]._id === shuttle._id) {
                return i;
            }
        }
    } else {
        console.log('arr not defined');
    }
    return -1;
}

export function getIndexOfShuttleInList(list: any[], shuttle: Shuttle): number {
    // console.log(list);

    if (list && shuttle) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].shuttle && list[i].shuttle._id === shuttle._id) {
                return i;
            }
        }
    } else {
        console.log('list not defined');
    }
    return -1;
}
