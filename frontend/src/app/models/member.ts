import { Type } from "class-transformer";
import 'reflect-metadata';

export class User {
  pseudo?: string;
  password?: string;
  fullName?: string;
  @Type(() => Date)
  birthDate?: Date;

  get display(): string {
    return `${this.pseudo} (${this.birthDate ? this.age + ' years old' : 'age unknown'})`;
  }

  get age(): number | undefined {
    if (!this.birthDate)
        return undefined;
    var today = new Date();
    var age = today.getFullYear() - this.birthDate.getFullYear();
    today.setFullYear(today.getFullYear() - age);
    if (this.birthDate > today) age--;
    return age;
  }
}
