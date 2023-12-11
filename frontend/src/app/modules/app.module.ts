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
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { LoginComponent } from '../components/login/login.component';
import { SignUpComponent } from '../components/signup/signup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetFocusDirective } from '../directives/setfocus.directive';
import { EditMemberComponent } from '../components/edit-member/edit-member.component';
import { SharedModule } from './shared.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { fr } from 'date-fns/locale';
import { QuizesContainerComponent } from '../components/quiz/group-container.component';
import { QuizTestComponent } from '../components/quiz/quiz-test.component';
import { QuestionComponent } from '../components/question/question.component';
import {TestCodeEditorComponent} from '../components/code-editor/test-code-editor.component';
import {CodeEditorComponent} from '../components/code-editor/code-editor.component';
import { TeacherComponent } from '../components/teacher/teacher.component';
import { QuizEditionComponent } from '../components/quiz-edition/quiz-edition.component';
@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    MemberListComponent,
    LoginComponent,
    UnknownComponent,
    RestrictedComponent,
    SetFocusDirective,
    EditMemberComponent,
    SignUpComponent,
    QuizesContainerComponent,
    QuizTestComponent,
    QuestionComponent,
    TestCodeEditorComponent,
    CodeEditorComponent,
    TeacherComponent,
    QuizEditionComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutes,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: fr },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['dd/MM/yyyy'],
        },
        display: {
          dateInput: 'dd/MM/yyyy',
          monthYearLabel: 'MMM yyyy',
          dateA11yLabel: 'dd/MM/yyyy',
          monthYearA11yLabel: 'MMM yyyy',
        },
      },
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
