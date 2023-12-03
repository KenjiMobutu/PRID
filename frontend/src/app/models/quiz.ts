import 'reflect-metadata';

export class DataBase {
  databaseId: number | undefined;
  name?: string;
  description?: string;
}

export class Question {
    id: number | undefined;
    order: number | undefined;
    body?: string;
}

export enum QuizStatus{
  EnCours = 0,
  Fini = 1,
  PasCommence = 2,
  Cloture = 3
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
