import {Pipe, PipeTransform} from '@angular/core';
import {MultiLangName} from '@models/district';

@Pipe({
    name: 'localityName'
})
export class LocalityNamePipe implements PipeTransform {

    transform(value: MultiLangName, lang: string): string {
        let ret: string;
        if (lang === 'it') {
            ret = value.it;
        } else {
            ret = value.de;
        }
        return this.beautifyLocalityName(ret);
    }

    private beautifyLocalityName(localityName: string): string {
        if (localityName) {
            const toRemove = [
                'Valgardena',
                'all\' Isarco',
                'allo Sciliar',
                'in Badia',
                'Atesino',
                'sulla strada del vino',
                'in Passiria',
                'Venosta',
                'an der Weinstraße',
                'am Schlern',
                'in Gröden',
                'im Vinschgau',
                'in Passeier'
            ];
            toRemove.map((s) => {
                localityName = localityName.replace(new RegExp(s, 'ig'), '').trim();
            });
        }
        return localityName;
    }

}
