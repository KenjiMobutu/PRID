import { Type } from "class-transformer";
import { differenceInYears } from 'date-fns';
import 'reflect-metadata';


export enum Role {
  Student = 0,
  Teacher = 1,
  Admin = 2
}
export class User {
  id: number | undefined;
  pseudo?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  @Type(() => Date)
  birthDate?: Date;
  role: Role = Role.Student;
  token?: string;
  refreshToken?: string;

  public get roleAsString(): string {
    return Role[this.role];
  }

  get display(): string {
    return `${this.pseudo} (${this.birthDate ? this.age + ' years old' : 'age unknown'})`;
  }

  get age(): number | undefined {
    if (!this.birthDate)
        return undefined;
    var today = new Date();
    return differenceInYears(today, this.birthDate);
  }
}

