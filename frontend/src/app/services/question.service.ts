import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Quiz, Question } from '../models/quiz';
import { tap } from 'rxjs/operators';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getAll(): Observable<Question[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/question`).pipe(
      map(res => plainToInstance(Question, res))
    );
  }

  getById(id: number) {
    return this.http.get<Question>(`${this.baseUrl}api/question/${id}`).pipe(
      map(m => plainToInstance(Question, m)),
      catchError(err => of(null))
    );
  }


  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    const url = `${this.baseUrl}api/quiz/${quizId}/questions`;
    console.log('!!!!!!URL:', url);
    return this.http.get<Question[]>(url).pipe(
      tap(questions => console.log('Questions:', questions)),
    );
  }




}
