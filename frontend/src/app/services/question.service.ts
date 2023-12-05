import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Quiz, Question } from '../models/quiz';
import { switchMap, tap } from 'rxjs/operators';

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

  getByIdaaa(id: number) {
    return this.http.get<Question>(`${this.baseUrl}api/question/${id}`).pipe(
      map(m => plainToInstance(Question, m)),
      catchError(err => of(null))
    );
  }


  getQuestionsByQuizIdaaa(quizId: number): Observable<Question[]> {
    const url = `${this.baseUrl}api/quiz/${quizId}/questions`;
    console.log('!!!!!!URL:', url);
    return this.http.get<Question[]>(url).pipe(
      tap(questions => console.log('****Questions:', questions)),
    );
  }

   // Obtenir toutes les questions liées à un quiz spécifié
  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    const url = `${this.baseUrl}api/quiz/${quizId}/questions`;
    return this.http.get<Question[]>(url);
  }
  

  // Obtenez une question par ID
  getById(questionId: number): Observable<Question> {
    const url = `${this.baseUrl}api/question/${questionId}`;
    return this.http.get<Question>(url);
  }

  getByOrder(quizId: number, order: number): Observable<Question> {
    const url = `${this.baseUrl}api/quiz/${quizId}/questions/${order}`;
    return this.http.get<Question>(url);
  }

  getQuizIdByQuestionId(questionId: number): Observable<number | null> {
    const url = `${this.baseUrl}api/question/${questionId}/quiz`;
    return this.http.get<Question>(url).pipe(
      map(question => question?.id || null),
      catchError(err => of(null))
    );
  }

}
