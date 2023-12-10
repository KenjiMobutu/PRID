import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Quiz } from '../models/quiz';
import { Solution } from "../models/solution";

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { pl } from "date-fns/locale";

@Injectable({ providedIn: 'root' })
export class SolutionService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getAll(): Observable<Solution[]> {
    return this.http.get<any[]>(`${this.baseUrl}api/solution`).pipe(
      map(res => plainToInstance(Solution, res))
    );
  }

  getOne(id: number) {
    return this.http.get<Solution>(`${this.baseUrl}api/solution/${id}`).pipe(
      map(m => plainToInstance(Solution, m)),
      catchError(err => of(null))
    );
  }

  getByQuestionId(questionId: number): Observable<Solution[]> {
    const url = `${this.baseUrl}api/solution/${questionId}/solutions`;
    console.log('!!!!!!URL:', url);
    return this.http.get<Solution[]>(url).pipe(
      map(res => plainToInstance(Solution, res))
    );
  }

  sendSolution(questionId: number, sql: string): Observable<boolean> {
    console.log("--> SQL:"+sql);
    return this.http.get<Solution>(`${this.baseUrl}api/solution/${questionId}/${sql}`).pipe(
      map(res => true),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  getColumnNames(sql: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}api/solution/${sql}/columns`).pipe(
      map(res => res)
    );
  }

  getDataRows(sql: string): Observable<string[][]> {
    return this.http.get<string[][]>(`${this.baseUrl}api/solution/${sql}/rows`).pipe(
      map(res => res)
    );
  }


}