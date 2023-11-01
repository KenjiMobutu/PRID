import { Type } from "class-transformer";
import { differenceInYears } from 'date-fns';
import 'reflect-metadata';

export class User {
  id: number | undefined;
  pseudo?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  @Type(() => Date)
  birthDate?: Date;
  role: Role = Role.User;
  token?: string;

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
export enum Role {
  User = 0,
  Manager = 1,
  Admin = 2
}
