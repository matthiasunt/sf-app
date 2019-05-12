import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'contrastColor'
})
export class ContrastColorPipe implements PipeTransform {
    transform(value: any): BlackOrWhite {
        const r = parseInt(value.substr(1, 2), 16);
        const g = parseInt(value.substr(3, 2), 16);
        const b = parseInt(value.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 160) ? BlackOrWhite.black : BlackOrWhite.white;
    }

}

enum BlackOrWhite {
    black = 'black',
    white = 'white'
}
