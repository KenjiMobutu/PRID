import { Quiz } from "./quiz";

export class DataBase{
  id!: number;
  name!: string;
  description?: string;

  quizzes: Quiz[] = [];
}
