import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Answer, Attempt, Quiz } from '../models/quiz';
import { Solution } from "../models/solution";

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { pl, tr } from "date-fns/locale";

@Injectable({ providedIn: 'root' })

export class AttemptService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getByQuizId(quizId: number): Observable<Attempt[]> {
    return this.http.get<Attempt[]>(`${this.baseUrl}api/attempt/${quizId}/attempts`).pipe(
      map(res => res)
    );
  }

  public add(quizId: number, userId: number): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.baseUrl}api/attempt/${quizId}/${userId}`,{}).pipe(
    );
  }

  public update(attemptId: number): Observable<boolean> {
    return this.http.put<Attempt>(`${this.baseUrl}api/attempt/${attemptId}/finish`, {}).pipe(
        map(res => true),
        catchError(err => {
            console.error(err);
            return of(false);
        })
    );
  }

  newAttempt(questionId: number, Query: string, DbName:string): Observable<boolean> {
    console.log("--> SQL:"+Query);
    return this.http.post<Solution>(`${this.baseUrl}api/attempt/queryPost`,{questionId, Query, DbName}).pipe(
      map(res => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
