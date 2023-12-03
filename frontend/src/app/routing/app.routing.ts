import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from '../components/home/home.component';
import { CounterComponent } from '../components/counter/counter.component';
import { FetchDataComponent } from '../components/fetch-data/fetch-data.component';
import { MemberListComponent } from '../components/memberlist/memberlist.component';
import { RestrictedComponent } from '../components/restricted/restricted.component';
import { LoginComponent } from '../components/login/login.component';
import { UnknownComponent } from '../components/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/member';
import { SignUpComponent } from '../components/signup/signup.component';
import { QuizesContainerComponent } from '../components/quiz/group-container.component';
import { QuestionComponent } from '../components/question/question.component';
const appRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'counter', component: CounterComponent },
    { path: 'fetch-data', component: FetchDataComponent },
    { path: 'members',component: MemberListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    { path: 'login',component: LoginComponent},
    { path: 'signup',component: SignUpComponent},
    { path: 'quiz',component: QuizesContainerComponent},
    { path: 'question/:id',component: QuestionComponent},
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
