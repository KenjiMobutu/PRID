import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';
import { User } from '../models/member';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { DateFilterFn } from '@angular/material/datepicker';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    // l'utilisateur couramment connecté (undefined sinon)
    public currentUser?: User;

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
        // au départ on récupère un éventuel utilisateur stocké dans le sessionStorage
        let data = sessionStorage.getItem('currentUser');
        if (data)
            data = JSON.parse(data);
        this.currentUser = plainToClass(User, data);
    }

    login(pseudo: string, password: string) {
        return this.http.post<any>(`${this.baseUrl}api/users/authenticate`, { pseudo, password })
            .pipe(map(user => {
                user = plainToClass(User, user);
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUser = user;
                }

                return user;
            }));
    }

    refresh() {
        return this.http.post<User>(`${this.baseUrl}api/users/refresh`, this.currentUser).pipe(
            map(res => {
                this.currentUser!!.token = res.token;
                this.currentUser!!.refreshToken = res.refreshToken;
                sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                return res;
            })
        );
    }

    logout() {
        // remove user from local storage to log user out
        sessionStorage.removeItem('currentUser');
        this.currentUser = undefined;
    }

    public isPseudoAvailable(pseudo: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/users/available/${pseudo}`);
    }

    public signup(pseudo: string, email: string, firstName: string, lastName: string, birthDate: Date ,password: string ): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}api/users/signup`, { pseudo: pseudo, email:email, firstName: firstName, lastName: lastName, birthDate:birthDate, password: password }).pipe(
            mergeMap(res => this.login(pseudo, password)),
        );
    }
}
