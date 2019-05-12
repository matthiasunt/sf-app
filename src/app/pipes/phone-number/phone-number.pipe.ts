import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {

    transform(value: string): string {
        let ret = '';
        if (value.charAt(3) === '0') {
            ret += value.substring(3, 7) + ' ' + value.substring(7, 13);
        } else {
            ret += value.substring(3, 6) + ' ' + value.substring(6);
        }
        return ret;
    }

}
