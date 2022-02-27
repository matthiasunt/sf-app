import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'beautifulTime',
})
export class BeautifulTimePipe implements PipeTransform {
  transform(dateString: string, locale: string): string {
    return new Date(dateString).toLocaleString(locale, {
      hour: 'numeric',
      minute: 'numeric',
    });
  }
}
