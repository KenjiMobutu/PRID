import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';``
import { FormsModule, ReactiveFormsModule } from '@angular/forms';//ajout
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';//ajout
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../routing/app.routing';

import { AppComponent } from '../components/app/app.component';
import { NavMenuComponent } from '../components/nav-menu/nav-menu.component';
import { HomeComponent } from '../components/home/home.component';
import { CounterComponent } from '../components/counter/counter.component';
import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
import { MemberListComponent } from '../components/memberlist/memberlist.component';
//import { RestrictedComponent } from '../components/restricted/restricted.component';
//import { UnknownComponent } from '../components/unknown/unknown.component';
//import { JwtInterceptor } from '../interceptors/jwt.interceptor';
//import { LoginComponent } from '../components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    MemberListComponent,
    //LoginComponent,
    //UnknownComponent,
    //RestrictedComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutes

  ],
  providers: [
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
