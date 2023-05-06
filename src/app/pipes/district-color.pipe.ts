import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'districtColor',
})
export class DistrictColorPipe implements PipeTransform {
  transform(districtId: string): string {
    switch (districtId) {
      case 'italien-suedtirol-bozenumgebung':
        return '#DD2C00'; // deep orange
      case 'italien-suedtirol-burggrafenamt':
        return '#0091EA'; // cyan
      case 'italien-suedtirol-eisacktal':
        return '#3F51B5'; // indigo
      case 'italien-suedtirol-pustertal':
        return '#FFD600'; // yellow
      case 'italien-suedtirol-schlerngebietgroeden':
        return '#673AB7'; // deep purple
      case 'italien-suedtirol-ueberetschunterland':
        return '#CDDC39'; // lime
      case 'italien-suedtirol-vinschgau':
        return '#4CAF50'; // green
      case 'italien-suedtirol-wipptal':
        return '#FF6D00'; // orange
      default:
        return '#99CC33'; // teal
    }
  }
}
