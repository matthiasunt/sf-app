import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { LocalityNamePipe } from './locality-name/locality-name.pipe';
import { DistrictNamePipe } from './district-name/district-name.pipe';
import { PhoneNumberPipe } from './phone-number/phone-number.pipe';
import { ShuttleColorPipe } from './shuttle-color/shuttle-color.pipe';
import { ContrastColorPipe } from './contrast-color/contrast-color.pipe';
import { ShadeColorPipe } from './shade-color/shade-color.pipe';
import { DistrictColorPipe } from '@pipes/district-color/district-color.pipe';
import { ColorStylingPipe } from '@pipes/color-styling/color-styling.pipe';
import { BeautifulTimePipe } from '@pipes/beautiful-time/beautiful-time.pipe';
import { BeautifulDatePipe } from '@pipes/beautiful-date/beautiful-date.pipe';
import { ShuttleCalledLatelyPipe } from '@pipes/shuttle-called-lately/shuttle-called-lately.pipe';

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
    ShuttleCalledLatelyPipe,
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
    ShuttleCalledLatelyPipe,
  ],
})
export class PipesModule {}
