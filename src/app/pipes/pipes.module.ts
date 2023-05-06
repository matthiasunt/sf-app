import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { LocalityNamePipe } from './locality-name.pipe';
import { DistrictNamePipe } from './district-name.pipe';
import { PhoneNumberPipe } from './phone-number.pipe';
import { ShuttleColorPipe } from './shuttle-color.pipe';
import { ContrastColorPipe } from './contrast-color.pipe';
import { ShadeColorPipe } from './shade-color.pipe';
import { DistrictColorPipe } from '@pipes/district-color.pipe';
import { ColorStylingPipe } from '@pipes/color-styling.pipe';
import { BeautifulTimePipe } from '@pipes/beautiful-time.pipe';
import { BeautifulDatePipe } from '@pipes/beautiful-date.pipe';

@NgModule({
  declarations: [
    LocalityNamePipe,
    DistrictNamePipe,
    PhoneNumberPipe,
    ShuttleColorPipe,
    DistrictColorPipe,
    ContrastColorPipe,
    ShadeColorPipe,
    ColorStylingPipe,
    BeautifulTimePipe,
    BeautifulDatePipe,
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    LocalityNamePipe,
    DistrictNamePipe,
    PhoneNumberPipe,
    ShuttleColorPipe,
    DistrictColorPipe,
    ContrastColorPipe,
    ShadeColorPipe,
    ColorStylingPipe,
    BeautifulTimePipe,
    BeautifulDatePipe,
  ],
})
export class PipesModule {}
