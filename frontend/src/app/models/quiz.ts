import 'reflect-metadata';
import { Solution } from './solution';
import { DataBase } from './database';

export class Attempt {
  id: number | undefined;
  timeStamp: Date | undefined;
  score: number | undefined;
  quizId: number | undefined;
  userId: number | undefined;
  answers: Answer[] = [];
}
export class Question {
    id: number | undefined;
    order: number | undefined;
    body!: string;
    quizId: number | undefined; // ID du quiz auquel appartient la question
    solutions: Solution[] = [];
    answers: Answer[] = [];
    isOpen: boolean = false;
}

export class Query{
  ColumnNames = [] = [];
}

export enum QuizStatus{
  EnCours = 0,
  Fini = 1,
  PasCommence = 2,
  Cloture = 3,
  Publié = 5,
  NonPublié = 6
}

export class Answer {
  id: number | undefined;
  sql?: string;
  timeStamp: Date | undefined;
  isCorrect: boolean = false;
  question: Question | undefined;
  attempt: Attempt | undefined;
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
    database!: DataBase;
    databaseName?: string;
    databaseId: number | undefined;
    evaluation?: string;
    score?: string;
    status: QuizStatus = QuizStatus.PasCommence;
    questions: Question[] = [];
    attempts: Attempt[] = [];

    public get statusAsString(): string {
      return QuizStatus[this.status];
    }

    get display(): string {
      return `${this.name} - ${this.database} - ${this.start} - ${this.finish} - ${this.evaluation}- ${this.status}`;
  }
}
