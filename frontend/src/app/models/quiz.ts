import 'reflect-metadata';
import { Solution } from './solution';
export class DataBase {
  databaseId: number | undefined;
  name?: string;
  description?: string;
}

export class Question {
    id: number | undefined;
    order: number | undefined;
    body?: string;
    solutions: Solution[] = [];
    answers: Answer[] = [];
}

export enum QuizStatus{
  EnCours = 0,
  Fini = 1,
  PasCommence = 2,
  Cloture = 3
}

export class Answer {
  id: number | undefined;
  sql?: string;
  timeStamp: Date | undefined;
  isCorrect: boolean = false;
  questionId: number | undefined;
  attemptId: number | undefined;
}

export class Quiz {
    id: number | undefined;
    name?: string;
    description?: string;
    isPublished: boolean = false;
    isClosed: boolean = false;
    isTest: boolean = false;
    start?: Date;
    finish?: Date;
    dataBase?: string;
    evaluation?: string;
    status: QuizStatus = QuizStatus.PasCommence;
    questions: Question[] = [];

    public get statusAsString(): string {
      return QuizStatus[this.status];
    }

    get display(): string {
      return `${this.name} - ${this.dataBase} - ${this.start} - ${this.finish} - ${this.evaluation}- ${this.status}`;
  }
}
