import { Pipe, PipeTransform } from '@angular/core';
import { ContrastColorPipe } from '@pipes/contrast-color/contrast-color.pipe';

@Pipe({
  name: 'colorStyling',
})
export class ColorStylingPipe implements PipeTransform {
  transform(colorHexCode: string): any {
    const contrastColorPipe = new ContrastColorPipe();
    return {
      'background-color': colorHexCode,
      color: contrastColorPipe.transform(colorHexCode),
    };
  }
}
