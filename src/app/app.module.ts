import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {IonicStorageModule} from '@ionic/storage';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {NativeGeocoder} from '@ionic-native/native-geocoder/ngx';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {PipesModule} from '@pipes/pipes.module';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        PipesModule
    ],
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        UniqueDeviceID,
        Geolocation,
        NativeGeocoder,
        Diagnostic
    ],
    exports: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
