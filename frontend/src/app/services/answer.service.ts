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

  sendAnswer(questionId: number, sql: string): Observable<boolean> {
    console.log("--> SQL:"+sql);
    return this.http.get<Solution>(`${this.baseUrl}api/answer/${questionId}/${sql}`).pipe(
      map(res => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  getColumnNames(sql: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}api/answer/${sql}/columns`).pipe(
      map(res => res)
    );
  }

  getDataRows(sql: string): Observable<string[][]> {
    return this.http.get<string[][]>(`${this.baseUrl}api/answer/${sql}/rows`).pipe(
      map(res => res)
    );
  }

  getAnswers(attemptId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}api/answer/${attemptId}/answers`).pipe(
      map(res => res)
    );
  }
}
