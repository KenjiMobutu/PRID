import { Injectable, Inject } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
import { HttpClient } from '@angular/common/http';
import { Answer, Attempt, Quiz } from '../models/quiz';
import { Solution } from "../models/solution";

import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { pl } from "date-fns/locale";

@Injectable({ providedIn: 'root' })

export class AttemptService {
  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  getByQuizId(quizId: number): Observable<Attempt[]> {
    return this.http.get<Attempt[]>(`${this.baseUrl}api/attempt/${quizId}/attempts`).pipe(
      map(res => res)
    );
  }
}
