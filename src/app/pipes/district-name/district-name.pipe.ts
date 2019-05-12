import {Pipe, PipeTransform} from '@angular/core';
import {DistrictName} from '@models/district';

@Pipe({
    name: 'districtName'
})
export class DistrictNamePipe implements PipeTransform {

    transform(value: DistrictName, lang: string): string {
        switch (lang) {
            case 'de_st':
                return value.de_st;
            case 'it':
                return value.it;
            default:
                return value.de;
        }

    }

}
