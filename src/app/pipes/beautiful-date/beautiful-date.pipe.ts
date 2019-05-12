import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'beautifulDate'
})
export class BeautifulDatePipe implements PipeTransform {

    transform(dateString: string, locale: string): any {
        const ret = new Date(dateString).toLocaleString(locale,
            {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        return ret.charAt(0).toUpperCase() + ret.slice(1);
    }

}
