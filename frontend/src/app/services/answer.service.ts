import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Answer, Quiz } from '../models/quiz';
import { Solution } from "../models/solution";

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { pl } from "date-fns/locale";

@Injectable({ providedIn: 'root' })

export class AnswerService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  postQuery(questionId: number, Query: string, DbName:string): Observable<boolean> {
    console.log("--> SQL:"+Query);
    return this.http.post<Solution>(`${this.baseUrl}api/answer/queryPost`,{questionId, Query, DbName}).pipe(
      map(res => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  sendAnswer(questionId: number, attemptId: number, sql: string, isCorrect: boolean): Observable<boolean> {
    return this.http.post<Answer>(`${this.baseUrl}api/answer/sendAnswer`, {questionId, attemptId, sql, isCorrect}).pipe(
      map(res => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  getColumnNames(sql: string, dataBase:string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}api/answer/${sql}/${dataBase}/columns`).pipe(
      map(res => res)
    );
  }

  getDataRows(sql: string, dataBase:string): Observable<string[][]> {
    return this.http.get<string[][]>(`${this.baseUrl}api/answer/${sql}/${dataBase}/rows`).pipe(
      map(res => res)
    );
  }

  getAnswers(attemptId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}api/answer/${attemptId}/answers`).pipe(
      map(res => res)
    );
  }
}
