import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Quiz } from '../models/quiz';

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { NumberInput } from "@angular/cdk/coercion";
import { DataBase } from "../models/database";

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getAll(): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }

  getAllDatabase(): Observable<DataBase[]>{
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/database`).pipe(
      map(res => plainToInstance(DataBase, res))
    );
  }

  getDatabaseByName(name: string){
    return this.http.get<DataBase>(`${this.baseUrl}api/quiz/database/${name}`).pipe(
      map(res => plainToInstance(DataBase, res))
    );
  }

  getAllForTeacher(userId: number): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/teacher/${userId}`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }

  getTp(userId: number): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/${userId}/tp`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }

  getTest(userId: number): Observable<Quiz[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/quiz/${userId}/test`).pipe(
      map(res => plainToInstance(Quiz, res))
    );
  }
  getTestByUserAndQuiz(userId: number, quizId: number): Observable<Quiz> {
    return this.http.get<any>(`${this.baseUrl}api/quiz/${userId}/${quizId}/test`).pipe(
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


  public update(quizId:number ,q: Quiz): Observable<boolean> {
    return this.http.put<Quiz>(`${this.baseUrl}api/quiz/${quizId}`, q).pipe(
        map(res => true),
        catchError(err => {
            console.error(err);
            return of(false);
        })
    );
  }

  public add(q: Quiz): Observable<boolean> {
    return this.http.post<Quiz>(`${this.baseUrl}api/quiz/create`, q).pipe(
        map(res => true),
        catchError(err => {
            console.error(err);
            return of(false);
        })
    );
  }

  getByName(name: string) {
    return this.http.get<Quiz>(`${this.baseUrl}api/quiz/name/${name}`).pipe(
      map(q => plainToInstance(Quiz, q)),
      catchError(err => of(null))
    );
  }

  public isQuizNameAvailable(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}api/quiz/available/${name}`);
}

  closeQuiz(quizId: number): Observable<any> {
    return this.http.post(`/api/quiz/close/${quizId}`, {});
  }

  openQuiz(quizId: number): Observable<any> {
    return this.http.post(`/api/quiz/open/${quizId}`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}api/quiz/${id}`);
  }

  deleteAnswer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}api/quiz/${id}/answer`);
  }

}
