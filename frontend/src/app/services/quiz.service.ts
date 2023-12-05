import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Quiz } from '../models/quiz';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getAll(): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }
  getTp(): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/tp`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }
  getTest(): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/test`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }

  getOne(id: number) {
    return this.http.get<Quiz>(`${this.baseUrl}api/quiz/${id}`).pipe(
      map(m => plainToInstance(Quiz, m)),
      catchError(err => of(null))
    );
  }

  getQuestionsByQuizId(quizId: number): Observable<Quiz[]> {
    const url = `${this.baseUrl}api/quiz/${quizId}/questions`;
    console.log('!!!!!!URL:', url);
    return this.http.get<Quiz[]>(url).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }

  //get quiz by question id
  getQuizByQuestionId(questionId: number): Observable<Quiz> {
    const url = `${this.baseUrl}api/quiz/${questionId}/quiz`;
    return this.http.get<Quiz>(url);
  }


  public update(q: Quiz): Observable<boolean> {
    return this.http.put<Quiz>(`${this.baseUrl}api/quiz`, q).pipe(
        map(res => true),
        catchError(err => {
            console.error(err);
            return of(false);
        })
    );
}
}
