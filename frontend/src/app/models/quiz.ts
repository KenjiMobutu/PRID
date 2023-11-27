import { Type } from "class-transformer";
import { differenceInYears } from 'date-fns';
import 'reflect-metadata';

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

    get display(): string {
      return `${this.name}`;
    }
}
